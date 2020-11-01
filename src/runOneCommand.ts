
import Tuple, { newTuple } from './Tuple'
import TupleTag, { newTag } from './TupleTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandUtils'
import findPartitionsByTable from './findPartitionsByTable'
import CommandParams from './CommandParams'
import runJoinStep from './verbs/join'
import countCommand from './verbs/count'
import orderByCommand from './verbs/orderBy'
import watchCommand from './verbs/watch'
import setCommand from './verbs/set'
import getCommand from './verbs/get'
import runCommand from './verbs/run'
import deleteCommand from './verbs/delete'
import runJustStep from './verbs/just'
import QueryContext from './QueryContext'
import singleValue from './verbs/single-value'
import runQueryCommand from './verbs/run-query'
import renameCommand from './verbs/rename'
import traceCommand from './verbs/trace'
import envCommand from './verbs/env'
import { toRelation } from './coerce'
import { compileTupleModificationStream } from './compilation/TupleModificationFunc'
import Relation from './Relation'

function handleCommandContextTags(cxt: QueryContext, params: CommandParams) {
    if (params.tuple.hasAttr("debug.dumpTrace")) {
        cxt.enableDebugDumpTrace = true;
        params.tuple = params.tuple.removeAttr("debug.dumpTrace");
    }
}

function resolveImmediateExpressions(tuple: Tuple) {
    return tuple.remapTags((tag: TupleTag) => {
        if (tag.exprValue && tag.exprValue[0] === 'seconds-from-now') {
            const seconds = parseInt(tag.exprValue[1]);
            return tag.setValue(Date.now() + (seconds * 1000) + '');
        }

        return tag;
    });
}

export type VerbCallback = (cxt: QueryContext, params: CommandParams) => void

export const builtinVerbs: { [name: string]: VerbCallback } = {
    join: runJoinStep,
    just: (cxt, params) => runJustStep(params),
    get: (cxt, params) => getCommand(cxt, params.tuple, params.output),
    set: (cxt, params) => setCommand(cxt, params),
    run: (cxt, params) => runCommand(cxt, params),
    delete: (cxt, params) => deleteCommand(cxt, params),
    count: (cxt, params) => countCommand(cxt, params),
    'order-by': (cxt, params) => orderByCommand(params),
    watch: (cxt, params) => watchCommand(cxt, params),
    'single-value': (cxt, params) => singleValue(cxt, params),
    'run-query': (cxt, params) => runQueryCommand(cxt, params),
    rename: (cxt, params) => renameCommand(cxt, params),
    trace: (cxt, params) => traceCommand(cxt, params),
    env: (cxt, params) => envCommand(cxt, params),
}

let removeVerbArgs: Relation;

export default function runOneCommand(parentCxt: QueryContext, params: CommandParams) {

    const cxt = parentCxt.newChild();
    cxt.start("runOneCommand", { verb: params.verb, tuple: params.tuple.stringify() })

    const { flags, verb, output } = params;
    const originalTuple = params.tuple;
    params.tuple = resolveImmediateExpressions(originalTuple);
    cxt.verb = verb;

    handleCommandContextTags(cxt, params);

    cxt.input = params.input;
    emitCommandOutputFlags(flags, output);

    if (verb === 'trace')
        parentCxt.traceEnabled = true;

    if (cxt.traceEnabled) {
        for (const [table, partitionedTuple] of findPartitionsByTable(cxt, params.tuple)) {
            output.next(newTuple([newTag('trace'), newTag('matching-table'),
                                 newTag('table-name', table.name),
                                 newTag('partitioned-tuple', partitionedTuple)]));
        }
    }

    try {
        // console.log('runOneCommand', params.tuple.stringify())

        if (cxt.graph.definedVerbs[verb]) {
            cxt.graph.definedVerbs[verb](cxt, params);
            cxt.end('runOneCommand');
            return;
        }

        if (builtinVerbs[verb]) {
            builtinVerbs[verb](cxt, params);
            cxt.end('runOneCommand');
            return;
        }

        // Fall back to run-based commands.
        if (!removeVerbArgs)
            removeVerbArgs = toRelation([{'remove-attr': 'verb'}, {'remove-attr': 'args'}]);

        params.tuple = newTuple([newTag('verb', verb), newTag('args', params.tuple)]);
        params.output = compileTupleModificationStream(removeVerbArgs, params.output);
        builtinVerbs['run'](cxt, params);

        return;

        emitCommandError(output, "unrecognized verb: " + verb);
        output.done();

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(output, "internal error: " + (err.stack || err));
        output.done();
    }

    cxt.end('runOneCommand');
}
