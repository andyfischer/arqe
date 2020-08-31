
import Tuple from './Tuple'
import { emitCommandError } from './CommandMeta'
import Stream from './Stream'
import QueryWatch from './QueryWatch';
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

interface HandlerCallback {
    callback: TupleStreamCallback
    needsEvalHelper?: boolean
    needsInputStream?: boolean
    needsOutputStream?: boolean
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

class CommandHandler {
    command: string
    inputPattern: Tuple
    definiteValues: TupleTag[]
    uniqueExprs: TupleTag[]

    flags: HandlerFlags
    callback: TupleStreamCallback

    constructor(command: string, originalInput: Tuple, callback: TupleStreamCallback) {

        const { input, flags, definiteValues, uniqueExprs } = mountCommandHandler(originalInput);

        if (input.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.command = command;
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

class HandlersByCommand {
    entries: CommandHandler[] = []

    add(entry: CommandHandler) {
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
    const verb = cxt.callingQuery.verb;
    const helper = new QueryEvalHelper(cxt, verb, tuple);
    return tuple.setVal(contextEvalHelper, helper);
}

export default class TableMount {
    name: string
    schema: Tuple
    watches = new Map();

    allEntries: CommandHandler[] = []
    byCommand: AutoInitMap<string, HandlersByCommand>

    constructor(name: string, schema: Tuple) {
        this.name = name;
        this.schema = schema;
        this.byCommand = new AutoInitMap(name => new HandlersByCommand() )
    }

    addHandler(command: string, tuple: string | Tuple, callback: TupleStreamCallback) {
        if (typeof command !== 'string')
            throw new Error('expected string: ' + command);

        if (typeof tuple === 'string')
            tuple = parseTuple(tuple);

        const commandMatches  = this.byCommand.get(command);
        const handler: CommandHandler = new CommandHandler(command, tuple, callback);
        commandMatches.add(handler);
        this.allEntries.push(handler);
    }

    hasHandler(commandName: string, tuple: Tuple) {
        return !!this.find(commandName, tuple);
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

    callWithDefiniteValuesOrError(cxt: QueryContext, commandName: string, tuple: Tuple, out: Stream) {
        if (!this.callWithDefiniteValues(cxt, commandName, tuple, out)) {
            emitCommandError(out, `Table ${this.name} doesn't support: ${commandName} ${tuple.stringify()}`)
            out.done();
            return;
        }
    }

    addWatch(cxt: QueryContext, pattern: Tuple, watchId: string, watch: QueryWatch, out: Stream) {
        this.watches.set(watchId, watch);
        this.callWithDefiniteValues(cxt, 'add-watch', pattern, out);
    }

    entriesByCommand(commandName: string) {
        const byCommand = this.byCommand.getExisting(commandName);
        if (!byCommand)
            return []
        return byCommand.entries;
    }

    find(commandName: string, tuple: Tuple) {
        const matches = this.byCommand.get(commandName);
        if (!matches)
            return null;
        
        return matches.find(tuple);
    }

    findWithUnique(commandName: string, uniqueTag: TupleTag, tuple: Tuple) {
        for (const entry of this.entriesByCommand(commandName)) {
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

    findWithDefiniteValues(cxt: QueryContext, commandName: string, tuple: Tuple) {
        cxt.start('findWithDefiniteValues');
        for (const entry of this.entriesByCommand(commandName)) {
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
}