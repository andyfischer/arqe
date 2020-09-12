
import Tuple from './Tuple'
import { emitCommandError } from './CommandMeta'
import Stream from './Stream'
import { TupleTag } from '.';
import parseTuple from './parseTuple';
import QueryEvalHelper from './QueryEvalHelper';
import QueryContext from './QueryContext';
import { streamPostRemoveAttr } from './StreamUtil';
import AutoInitMap from "./utils/AutoInitMap"

export type TupleStreamCallback = (input: Tuple, out: Stream) => void

const contextInputStream = 'context.inputStream'
const contextOutputStream = 'context.outputStream'
const contextEvalHelper = 'context.evalHelper'

export type MountId = string;

function getDefiniteValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => {
        if (tag.isUniqueExpr())
            return false;
        return !!tag.attr;
    })
}

function getUniqueExprTags(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => tag.isUniqueExpr());
}

interface HandlerFlags {
    needsEvalHelper?: boolean
    needsInputStream?: boolean
    needsOutputStream?: boolean
}

function mountCommandHandler(input: Tuple) {
    const flags:HandlerFlags = {};

    if (input.hasAttr(contextEvalHelper)) {
        flags.needsEvalHelper = true;
        input = input.removeAttr(contextEvalHelper);
    }
    
    if (input.hasAttr(contextInputStream)) {
        flags.needsInputStream = true;
        input = input.removeAttr(contextInputStream);
    }

    if (input.hasAttr(contextOutputStream)) {
        flags.needsOutputStream = true;
        input = input.removeAttr(contextOutputStream);
    }

    return {
        input,
        flags,
        definiteValues: getDefiniteValueTags(input),
        uniqueExprs: getUniqueExprTags(input)
    }
}

class Handler {
    verb: string
    inputPattern: Tuple
    definiteValues: TupleTag[]
    uniqueExprs: TupleTag[]

    flags: HandlerFlags
    callback: TupleStreamCallback

    constructor(verb: string, originalInput: Tuple, callback: TupleStreamCallback) {

        const { input, flags, definiteValues, uniqueExprs } = mountCommandHandler(originalInput);

        if (input.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.verb = verb;
        this.inputPattern = input;
        this.flags = flags;
        this.definiteValues = definiteValues;
        this.uniqueExprs = uniqueExprs;
        this.callback = callback;
    }

    checkHasDefiniteValues(tuple: Tuple) {
        for (const tag of this.definiteValues) {
            const matchingTag = tuple.getTag(tag.attr);
            if (!matchingTag || !matchingTag.hasValue())
                return false;
        }
        return true;
    }
}

class HandlersByVerb {
    entries: Handler[] = []

    add(entry: Handler) {
        this.entries.push(entry)
    }

    find(tuple: Tuple) {
        for (const entry of this.entries) {
            if (entry.inputPattern.checkDefiniteValuesProvidedBy(tuple))
                return entry;
        }
        return null;
    }
}

function insertEvalHelperTag(cxt: QueryContext, tuple: Tuple) {
    const verb = cxt.verb;
    const helper = new QueryEvalHelper(cxt, verb, tuple);
    return tuple.setVal(contextEvalHelper, helper);
}

export default class TableMount {
    mountId: MountId
    name: string
    schema: Tuple
    watches = new Map();

    allEntries: Handler[] = []
    byVerb: AutoInitMap<string, HandlersByVerb>

    listeners = new Map<string, true>()

    constructor(name: string, schema: Tuple) {
        this.name = name;
        this.schema = schema;
        this.byVerb = new AutoInitMap(name => new HandlersByVerb() )
    }

    addHandler(verb: string, tuple: string | Tuple, callback: TupleStreamCallback) {
        if (typeof verb !== 'string')
            throw new Error('expected string: ' + verb);

        if (typeof tuple === 'string')
            tuple = parseTuple(tuple);

        const commandMatches  = this.byVerb.get(verb);
        const handler: Handler = new Handler(verb, tuple, callback);
        commandMatches.add(handler);
        this.allEntries.push(handler);
    }

    hasHandler(verb: string, tuple: Tuple) {
        return !!this.find(verb, tuple);
    }

    callVerb(cxt: QueryContext, verb: string, tuple: Tuple, out: Stream) {
        const matches = this.byVerb.get(verb);
        if (!matches)
            return false;

        const entry = matches.entries[0];
        if (!entry)
            return false;

        entry.callback(tuple, out);
        return true;
    }

    callInsertUnique(uniqueTag: TupleTag, tuple: Tuple, out: Stream): boolean {
        // Find a matching entry that has ((unique)) for this tag.
        const entry = this.findWithUnique('insert', uniqueTag, tuple);

        if (!entry)
            return false;

        entry.callback(tuple, out);
        return true;
    }

    callWithDefiniteValues(cxt: QueryContext, verb: string, tuple: Tuple, out: Stream): boolean {
        const handler = this.findWithDefiniteValues(cxt, verb, tuple);
        if (!handler)
            return false;

        if (handler.flags.needsEvalHelper) {
            out = streamPostRemoveAttr(out, contextEvalHelper);
            tuple = insertEvalHelperTag(cxt, tuple);
        }

        if (handler.flags.needsInputStream) {
            out = streamPostRemoveAttr(out, contextInputStream);
            tuple = tuple.setVal(contextInputStream, cxt.input);
        }
        
        if (handler.flags.needsOutputStream) {
            out = streamPostRemoveAttr(out, contextOutputStream);
            tuple = tuple.setVal(contextOutputStream, out);
        }

        handler.callback(tuple, out);
        return true;
    }

    callWithDefiniteValuesOrError(cxt: QueryContext, verb: string, tuple: Tuple, out: Stream) {
        if (!this.callWithDefiniteValues(cxt, verb, tuple, out)) {
            emitCommandError(out, `Table ${this.name} doesn't support: ${verb} ${tuple.stringify()}`)
            out.done();
            return;
        }
    }

    entriesByVerb(verb: string) {
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
        for (const entry of this.entriesByVerb(verb)) {
            if (entry.uniqueExprs.length !== 1)
                continue;

            if (entry.uniqueExprs[0].attr !== uniqueTag.attr)
                continue;

            if (!entry.checkHasDefiniteValues(tuple))
                continue;

            return entry;
        }

        return null;
    }

    findWithDefiniteValues(cxt: QueryContext, verb: string, tuple: Tuple) {
        cxt.start('findWithDefiniteValues');
        for (const entry of this.entriesByVerb(verb)) {
            if (entry.uniqueExprs.length > 0)
                continue;

            if (entry.checkHasDefiniteValues(tuple)) {
                cxt.end('findWithDefiniteValues');
                return entry;
            }
        }

        cxt.end('findWithDefiniteValues');
        return null;
    }

    pushChangeEvent(cxt) {
        for (const liveQueryId of this.listeners.keys()) {
            cxt.graph.pushChangeEvent(liveQueryId);
        }
    }
}
