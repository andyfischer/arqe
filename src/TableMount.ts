
import Tuple, { newTuple } from './Tuple'
import { emitCommandError } from './CommandUtils'
import Stream from './Stream'
import TupleTag, { newTag } from './TupleTag';
import parseTuple from './stringFormat/parseTuple';
import QueryEvalHelper from './QueryEvalHelper';
import QueryContext from './QueryContext';
import { streamPostRemoveAttr } from './StreamUtil';
import AutoInitMap from "./utils/AutoInitMap"
import { LiveQueryId } from './LiveQuery'
import { isUniqueTag, isEnvTag } from './knownTags'
import { compileTupleModificationStream } from './compilation/TupleModificationFunc'
import Relation from './Relation'
import { QueryLike } from './coerce'

export type TupleStreamCallback = (input: Tuple, out: Stream) => void

const contextInputStream = 'context.inputStream'
const contextOutputStream = 'context.outputStream'
const contextEvalHelper = 'context.evalHelper'
const contextSubquery = 'context.subquery'

export type MountId = string;

function getDefiniteValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => {
        if (isUniqueTag(tag))
            return false;
        if (isEnvTag(tag))
            return false;
        return !!tag.attr;
    })
}

function getTagsWithUnique(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => isUniqueTag(tag));
}

interface PreCallStep {
    injectEvalHelper?: boolean
    injectInputStream?: boolean
    injectOutputStream?: boolean
    injectFromEnv?: string
    injectSubquery?: boolean
}

function mountCommandHandler(mountInput: Tuple) {
    const steps: PreCallStep[] = [];
    const postResultModify: Tuple[] = [];

    if (mountInput.hasAttr(contextEvalHelper)) {
        steps.push({injectEvalHelper: true});
        mountInput = mountInput.removeAttr(contextEvalHelper);
        postResultModify.push(newTuple(newTag('remove-attr', contextEvalHelper)));
    }
    
    if (mountInput.hasAttr(contextInputStream)) {
        steps.push({injectInputStream: true});
        mountInput = mountInput.removeAttr(contextInputStream);
        postResultModify.push(newTuple(newTag('remove-attr', contextInputStream)));
    }

    if (mountInput.hasAttr(contextOutputStream)) {
        steps.push({injectOutputStream: true});
        mountInput = mountInput.removeAttr(contextOutputStream);
        postResultModify.push(newTuple(newTag('remove-attr', contextOutputStream)));
    }
    
    if (mountInput.hasAttr(contextSubquery)) {
        steps.push({injectSubquery: true});
        mountInput = mountInput.removeAttr(contextSubquery);
        postResultModify.push(newTuple(newTag('remove-attr', contextSubquery)));
    }

    for (const tag of mountInput.tags) {
        if (isEnvTag(tag)) {
            steps.push({injectFromEnv: tag.attr});
            mountInput = mountInput.removeAttr(tag.attr);
            postResultModify.push(newTuple(newTag('remove-attr', tag.attr)));
        }
    }

    return {
        input: mountInput,
        steps,
        definiteValues: getDefiniteValueTags(mountInput),
        tagsWithUnique: getTagsWithUnique(mountInput),
        postResultModify
    }
}

class Handler {
    verb: string
    inputPattern: Tuple
    definiteValues: TupleTag[]
    tagsWithUnique: TupleTag[]

    steps: PreCallStep[]
    callback: TupleStreamCallback
    postResultModify: Relation

    constructor(verb: string, originalInput: Tuple, callback: TupleStreamCallback) {

        const { input, steps, definiteValues, tagsWithUnique, postResultModify } = mountCommandHandler(originalInput);

        if (input.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.verb = verb;
        this.inputPattern = input;
        this.steps = steps;
        this.definiteValues = definiteValues;
        this.tagsWithUnique = tagsWithUnique;
        this.callback = callback;
        this.postResultModify = new Relation(postResultModify);
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

interface Listener {
    /* Query-fixed means that this listener is statically based on the query, and has
       the same lifetime. 'Dynamic' means that the listener is based on a dynamic value
       (from 'run-query') */

    type: 'queryFixed' | 'dynamic'
}

export default class TableMount {
    mountId: MountId
    name: string
    schema: Tuple
    watches = new Map();

    allEntries: Handler[] = []
    byVerb: AutoInitMap<string, HandlersByVerb>

    listeners = new Map<LiveQueryId, Listener>()

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
        // Find a matching entry that has (unique) for this tag.
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

        out = compileTupleModificationStream(handler.postResultModify, out);

        for (const step of handler.steps) {
            if (step.injectEvalHelper) {
                tuple = insertEvalHelperTag(cxt, tuple);
            }

            if (step.injectInputStream) {
                tuple = tuple.setVal(contextInputStream, cxt.input);
            }
            
            if (step.injectOutputStream) {
                tuple = tuple.setVal(contextOutputStream, out);
            }

            if (step.injectFromEnv) {
                tuple = tuple.setVal(step.injectFromEnv, cxt.getEnv(step.injectFromEnv));
            }

            if (step.injectSubquery) {
                tuple = tuple.setVal(contextSubquery, (query: QueryLike, out: Stream) => cxt.makeSubquery(query, out));
            }
        }

        try {
            const result: any = handler.callback(tuple, out);

            if (result && result.then) {
                result.catch(err => {
                    emitCommandError(out, err);
                    out.done();
                });
            }
        } catch (err) {
            emitCommandError(out, err);
            out.done();
        }

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
            if (entry.tagsWithUnique.length !== 1)
                continue;

            if (entry.tagsWithUnique[0].attr !== uniqueTag.attr)
                continue;

            if (!entry.checkHasDefiniteValues(tuple))
                continue;

            return entry;
        }

        return null;
    }

    findWithDefiniteValues(cxt: QueryContext, verb: string, tuple: Tuple) {
        for (const entry of this.entriesByVerb(verb)) {
            if (entry.tagsWithUnique.length > 0)
                continue;

            if (entry.checkHasDefiniteValues(tuple)) {
                cxt.end('findWithDefiniteValues');
                return entry;
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
