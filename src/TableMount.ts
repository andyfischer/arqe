
import Tuple, { newTuple, isTuple, newTupleWithVerb } from './Tuple'
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
import Query from './Query'
import { toTuple, TupleLike, toQuery, QueryLike } from './coerce'
import TableMatcher from './TableMatcher'
import Handler from './Handler'

export type TupleStreamCallback = (input: Tuple, out: Stream) => void
export type MountId = string;

interface FindHandlerOptions {
    acceptAbstract?: boolean
}

class HandlersByVerb {
    entries: Handler[] = []

    add(entry: Handler) {
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

function resolveDeclaredSchema(declaredSchema: Tuple) {

    let resolved = declaredSchema;

    if (declaredSchema.getVerb() === 'table') {

        resolved = newTuple([]);

        for (const tag of declaredSchema.tags) {
            if (tag.attr === 'table')
                continue;

            if (tag.attr === 'keys' || tag.attr === 'required') {
                for (const keyTag of tag.value.tags) {
                    resolved = resolved.addTag(newSimpleTag(keyTag.attr, newTupleWithVerb('key')));
                }
            } else if (tag.attr === 'values') {
                for (const valueTag of tag.value.tags) {
                    resolved = resolved.addTag(newSimpleTag(valueTag.attr, newTupleWithVerb('value')));
                }

            } else {
                throw new Error('unexpected attr in table declaration: ' + tag.attr);
            }
        }
    }

    // If there are no required keys then they are all required.
    let hasAnyKeys = false;
    for (const tag of resolved.tags) {
        if (tag.getTupleVerb() === 'key') {
            hasAnyKeys = true;
            break;
        }
    }

    if (!hasAnyKeys) {
        resolved = resolved.remapTags(tag => {
            if (!tag.hasValue())
                return tag.setValue(newTupleWithVerb('key'))
            return tag;
        });
    }

    return resolved;
}

export default class TableMount {
    mountId: MountId
    name: string
    declaredSchema: Tuple
    schema: Tuple
    matcher: TableMatcher
    watches = new Map();

    allEntries: Handler[] = []
    byVerb: AutoInitMap<string, HandlersByVerb>

    listeners = new Map<LiveQueryId, Listener>()

    constructor(name: string, declaredSchema: Tuple) {
        this.name = name;
        this.byVerb = new AutoInitMap(name => new HandlersByVerb() )
        this.declaredSchema = declaredSchema;
        this.schema = resolveDeclaredSchema(declaredSchema);
        this.matcher = new TableMatcher(this.schema);
    }

    _addHandler(handler: Handler) {
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

        const handler: Handler = new Handler(this, verb, tuple);
        handler.setNativeCallback(callback);
        this._addHandler(handler);
    }

    addQueryHandler(verb: string, tupleLike: TupleLike, queryLike: QueryLike) {
        const tuple = toTuple(tupleLike);
        const handler: Handler = new Handler(this, verb, tuple);
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

        handler.call(cxt, tuple)
        .sendTo(out);

        return true;
    }

    callWithDefiniteValues(cxt: QueryContext, verb: string, tuple: Tuple, out: Stream): boolean {
        const handler = this.findWithDefiniteValues(cxt, verb, tuple);
        if (!handler)
            return false;

        handler.call(cxt, tuple)
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

    handlerAllows(handler: Handler, verb: string, input: Tuple, opts: FindHandlerOptions) {
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
