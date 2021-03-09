
import Tuple, { newTuple, isTuple } from './Tuple'
import { emitCommandError } from './CommandUtils'
import Stream from './Stream'
import Tag, { newTag, newSimpleTag } from './Tag';
import parseTuple from './parser/parseTuple';
import QueryContext from './QueryContext';
import { streamPostRemoveAttr } from './StreamUtil';
import AutoInitMap from "./utils/AutoInitMap"
import { LiveQueryId } from './LiveQuery'
import Relation from './Relation'
import Pipe from './Pipe'
import { callTableHandler } from './callTableHandler'
import Query from './Query'
import { toTuple, TupleLike, toQuery, QueryLike } from './coerce'

export type TupleStreamCallback = (input: Tuple, out: Stream) => void
export type MountId = string;

interface FindHandlerOptions {
    acceptAbstract?: boolean
}

function getTagsWithUnique(tuple: Tuple) {
    return tuple.tags.filter((tag: Tag) => tag.getTupleVerb() === 'unique');
}

function getRequiredValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: Tag) => {
        const verb = tag.getTupleVerb();
        if (verb === 'unique')
            return false;
        if (verb === 'env')
            return false;
        if (verb === 'subquery')
            return false;
        if (verb === 'scope')
            return false;
        return !!tag.attr;
    })
}

export class VerbHandler {
    verb: string
    mountPattern: Tuple
    requiredValues: Tag[]
    tagsWithUnique: Tag[]
    mount: TableMount

    nativeCallback?: TupleStreamCallback
    query?: Query

    constructor(mount: TableMount, verb: string, mountPattern: Tuple) {
        this.mount = mount;
        this.verb = verb;
        this.requiredValues = getRequiredValueTags(mountPattern);
        this.tagsWithUnique = getTagsWithUnique(mountPattern);

        if (mountPattern.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.mountPattern = mountPattern;
    }

    setNativeCallback(nativeCallback: TupleStreamCallback) {
        this.nativeCallback = nativeCallback;
    }

    setQuery(query: Query) {
        this.query = query;
    }

    checkHasRequiredValues(input: Tuple) {
        for (const tag of this.requiredValues) {
            const matchingTag = input.getTag(tag.attr);
            if (!matchingTag || !matchingTag.hasValue() || matchingTag.isAbstractValue())
                return false;
        }
        return true;
    }
}

class HandlersByVerb {
    entries: VerbHandler[] = []

    add(entry: VerbHandler) {
        this.entries.push(entry)
    }

    find(tuple: Tuple) {
        for (const entry of this.entries) {
            if (entry.mountPattern.checkRequiredValuesProvidedBy(tuple))
                return entry;
        }
        return null;
    }
}

interface Listener {
    /* Query-fixed means that this listener is statically based on the query, and has
       the same lifetime. 'Dynamic' means that the listener is based on a dynamic value
       (from 'run-query') */

    type: 'queryFixed' | 'dynamic'
}

export default class TableMount {
    mountId: MountId
    name: string
    declaredSchema: Tuple
    schema: Tuple
    requiredKeys: Tuple | null
    watches = new Map();

    allEntries: VerbHandler[] = []
    byVerb: AutoInitMap<string, HandlersByVerb>

    listeners = new Map<LiveQueryId, Listener>()

    constructor(name: string, schema: Tuple) {
        this.name = name;
        this.byVerb = new AutoInitMap(name => new HandlersByVerb() )

        const declaredSchema = schema;
        let requiredKeys;

        //console.log('declaredSchema = ', declaredSchema.stringify())
        if (declaredSchema.getVerb() === 'table') {
            //console.log('translating ', declaredSchema.stringify())
            // Newer style syntax
            let translatedSchema = new Tuple([]);

            for (const declaredTag of declaredSchema.tags) {
                if (declaredTag.attr === 'keys' || declaredTag.attr === 'required') {
                    for (const tag of declaredTag.value.tags) {
                        translatedSchema = translatedSchema.addTag(tag.setValue(newTuple([newSimpleTag('key')])));
                    }
                } else if (declaredTag.attr === 'values') {
                    for (const tag of declaredTag.value.tags) {
                        translatedSchema = translatedSchema.addTag(tag);
                    }
                } else if (declaredTag.attr === 'table') {
                    // ignore
                } else {
                    translatedSchema = translatedSchema.addTag(declaredTag);
                }
            }

            schema = translatedSchema;
        }

        const keyAttrs = schema.tags.filter(tag => (tag.isTupleValue() && tag.value.hasAttr('key')));
        if (keyAttrs.length > 0) {
            if (requiredKeys)
                requiredKeys = requiredKeys.addTags(keyAttrs);
            else
                requiredKeys = new Tuple(keyAttrs);
        }

        // If required() is missing then all attrs are required.
        if (!requiredKeys) {
            requiredKeys = schema;
        }

        this.requiredKeys = requiredKeys;
        this.schema = schema;
        this.declaredSchema = schema;
    }

    _addHandler(handler: VerbHandler) {
        const commandMatches  = this.byVerb.get(handler.verb);
        commandMatches.add(handler);
        this.allEntries.push(handler);
    }

    addHandler(verb: string, tupleLike: TupleLike, callback: TupleStreamCallback) {
        const tuple = toTuple(tupleLike);
        if (typeof verb !== 'string')
            throw new Error('expected string: ' + verb);

        if (verb === 'list-all') {
            throw new Error(`use 'find' instead of list-all`);
        }

        if (verb === 'find-with') {
            throw new Error(`use 'find' instead of find-with`);
        }

        const handler: VerbHandler = new VerbHandler(this, verb, tuple);
        handler.setNativeCallback(callback);
        this._addHandler(handler);
    }

    addQueryHandler(verb: string, tupleLike: TupleLike, queryLike: QueryLike) {
        const tuple = toTuple(tupleLike);
        const handler: VerbHandler = new VerbHandler(this, verb, tuple);
        handler.setQuery(toQuery(queryLike));
        this._addHandler(handler);
    }

    hasHandler(verb: string, tuple: Tuple) {
        return !!this.find(verb, tuple);
    }

    callInsertUnique(cxt: QueryContext, uniqueTag: Tag, tuple: Tuple, out: Stream): boolean {
        // Find a matching entry that has (unique) for this tag.
        const handler = this.findWithUnique('insert', uniqueTag, tuple);

        if (!handler)
            return false;

        callTableHandler(this.schema, handler, cxt, tuple)
        .sendTo(out);

        return true;
    }

    callWithDefiniteValues(cxt: QueryContext, verb: string, tuple: Tuple, out: Stream): boolean {
        const handler = this.findWithDefiniteValues(cxt, verb, tuple);
        if (!handler)
            return false;

        callTableHandler(this.schema, handler, cxt, tuple)
        .sendTo(out);

        return true;
    }

    callWithDefiniteValuesOrError(cxt: QueryContext, verb: string, tuple: Tuple, out: Stream) {
        if (!this.callWithDefiniteValues(cxt, verb, tuple, out)) {
            emitCommandError(out, `Table ${this.name} doesn't support: ${verb} ${tuple.stringify()}`)
            out.done();
            return;
        }
    }

    handlersByVerb(verb: string) {
        const byVerb = this.byVerb.getExisting(verb);
        if (!byVerb)
            return []
        return byVerb.entries;
    }

    find(verb: string, tuple: Tuple) {
        const matches = this.byVerb.get(verb);
        if (!matches)
            return null;
        
        return matches.find(tuple);
    }

    findWithUnique(verb: string, uniqueTag: Tag, tuple: Tuple) {
        for (const entry of this.handlersByVerb(verb)) {
            if (entry.tagsWithUnique.length !== 1)
                continue;

            if (entry.tagsWithUnique[0].attr !== uniqueTag.attr)
                continue;

            if (!entry.checkHasRequiredValues(tuple))
                continue;

            return entry;
        }

        return null;
    }

    findWithDefiniteValues(cxt: QueryContext, verb: string, tuple: Tuple) {
        for (const entry of this.handlersByVerb(verb)) {
            if (entry.tagsWithUnique.length > 0)
                continue;

            if (entry.checkHasRequiredValues(tuple)) {
                cxt.end('findWithDefiniteValues');
                return entry;
            }
        }

        return null;
    }

    handlerAllows(handler: VerbHandler, verb: string, input: Tuple, opts: FindHandlerOptions) {
        if (!opts.acceptAbstract && input.hasAnyAbstractValues())
            return false;

        for (const tag of handler.requiredValues) {
            const match = input.getTag(tag.attr);

            if (!match || !match.hasValue()) {

                if (opts.acceptAbstract && match.isAbstractValue())
                    continue;

                return false;
            }
        }

        for (const tag of handler.tagsWithUnique) {
            const match = input.getTag(tag.attr);
            if (!match || match.getTupleVerb() !== 'unique')
                return false;
        }

        return true;
    }

    findHandler(cxt: QueryContext, verb: string, tuple: Tuple, opts: FindHandlerOptions = {}) {
        for (const handler of this.handlersByVerb(verb)) {

            if (this.handlerAllows(handler, verb, tuple, opts)) {
                return handler;
            }
        }

        return null;
    }

    pushChangeEvent(cxt) {
        for (const liveQueryId of this.listeners.keys()) {
            cxt.graph.pushChangeEvent(liveQueryId);
        }
    }
}
