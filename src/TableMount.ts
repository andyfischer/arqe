
import Tuple, { newTuple, isTuple } from './Tuple'
import { emitCommandError } from './CommandUtils'
import Stream from './Stream'
import TupleTag, { newTag, newSimpleTag } from './TupleTag';
import parseTuple from './stringFormat/parseTuple';
import QueryContext from './QueryContext';
import { streamPostRemoveAttr } from './StreamUtil';
import AutoInitMap from "./utils/AutoInitMap"
import { LiveQueryId } from './LiveQuery'
import { isUniqueTag, isEnvTag, isSubqueryTag } from './knownTags'
import Relation from './Relation'
import Pipe from './Pipe'
import { QueryLike } from './coerce'
import { callTableHandler } from './callTableHandler'
import Query from './Query'

export type TupleStreamCallback = (input: Tuple, out: Stream) => void
export type MountId = string;

interface FindHandlerOptions {
    acceptAbstract?: boolean
}

function getTagsWithUnique(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => isUniqueTag(tag));
}

function getRequiredValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => {
        if (isUniqueTag(tag))
            return false;
        if (isEnvTag(tag))
            return false;
        if (isSubqueryTag(tag))
            return false;
        return !!tag.attr;
    })
}

class TableHandler {
    verb: string
    mountPattern: Tuple
    requiredValues: TupleTag[]
    tagsWithUnique: TupleTag[]
    callback: TupleStreamCallback

    constructor(verb: string, mountPattern: Tuple, callback: TupleStreamCallback) {
        this.verb = verb;
        this.requiredValues = getRequiredValueTags(mountPattern);
        this.tagsWithUnique = getTagsWithUnique(mountPattern);

        if (mountPattern.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.mountPattern = mountPattern;
        this.callback = callback;
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
    entries: TableHandler[] = []

    add(entry: TableHandler) {
        this.entries.push(entry)
    }

    find(tuple: Tuple) {
        for (const entry of this.entries) {
            if (entry.mountPattern.checkDefiniteValuesProvidedBy(tuple))
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

    allEntries: TableHandler[] = []
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

    addHandler(verb: string, tuple: string | Tuple, callback: TupleStreamCallback) {
        if (typeof verb !== 'string')
            throw new Error('expected string: ' + verb);

        if (verb === 'list-all') {
            throw new Error(`use 'find' instead of list-all`);
        }

        if (verb === 'find-with') {
            throw new Error(`use 'find' instead of find-with`);
        }

        if (typeof tuple === 'string')
            tuple = parseTuple(tuple);

        const commandMatches  = this.byVerb.get(verb);
        const handler: TableHandler = new TableHandler(verb, tuple, callback);
        commandMatches.add(handler);
        this.allEntries.push(handler);
    }

    hasHandler(verb: string, tuple: Tuple) {
        return !!this.find(verb, tuple);
    }

    callInsertUnique(cxt: QueryContext, uniqueTag: TupleTag, tuple: Tuple, out: Stream): boolean {
        // Find a matching entry that has (unique) for this tag.
        const handler = this.findWithUnique('insert', uniqueTag, tuple);

        if (!handler)
            return false;

        callTableHandler(this.schema, handler.mountPattern, handler.callback, cxt, tuple, out);
        return true;
    }

    callWithDefiniteValues(cxt: QueryContext, verb: string, tuple: Tuple, out: Stream): boolean {
        const handler = this.findWithDefiniteValues(cxt, verb, tuple);
        if (!handler)
            return false;

        callTableHandler(this.schema, handler.mountPattern, handler.callback, cxt, tuple, out);
        
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

    findWithUnique(verb: string, uniqueTag: TupleTag, tuple: Tuple) {
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

    handlerAllows(handler: TableHandler, verb: string, input: Tuple, opts: FindHandlerOptions) {
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
            if (!match || !isUniqueTag(match))
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
