
import Tuple from './Tuple'
import TupleTag from './TupleTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import CommandParams from './CommandParams'
import runJoinStep from './commands/join'
import listenCommand from './commands/listen'
import countCommand from './commands/count'
import orderByCommand from './commands/orderBy'
import watchCommand from './commands/watch'
import setCommand from './commands/set'
import getCommand from './commands/get'
import deleteCommand from './commands/delete'
import runJustStep from './commands/just'
import QueryContext from './QueryContext'
import singleValue from './commands/single-value'
import runQueryCommand from './commands/run-query'
import renameCommand from './commands/rename'
import { graphWithTableSet } from './setupTableSet'

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

export default function runOneCommand(parentCxt: QueryContext, params: CommandParams) {

    const cxt = new QueryContext(parentCxt.graph);
    cxt.start("runOneCommand", { verb: params.verb, tuple: params.tuple.stringify() })

    const { flags, verb, output } = params;
    const originalTuple = params.tuple;
    params.tuple = resolveImmediateExpressions(originalTuple);
    cxt.verb = verb;

    handleCommandContextTags(cxt, params);

    cxt.input = params.input;

    try {
        emitCommandOutputFlags(flags, output);

        switch (verb) {

        case 'join':
            runJoinStep(cxt, params);
            break;

        case 'just':
            runJustStep(params);
            break;

        case 'get': {
            getCommand(cxt, params.tuple, output);
            break;
        }
        
        case 'set': {
            setCommand(cxt, params);
            break;
        }

        case 'delete': {
            deleteCommand(cxt, params);
            break;
        }

        case 'listen': {
            listenCommand(cxt, params);
            break;
        }

        case 'count': {
            countCommand(cxt, params);
            break;
        }

        case 'order-by': {
            orderByCommand(params);
            break;
        }

        case 'watch': {
            watchCommand(cxt, params);
            break;
        }

        case 'single-value': {
            singleValue(cxt, params);
            break;
        }

        case 'run-query': {
            runQueryCommand(cxt, params);
            break;
        }

        case 'rename': {
            renameCommand(cxt, params);
            break;
        }

        default: {
            emitCommandError(output, "unrecognized verb: " + verb);
            output.done();
        }

        }

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(output, "internal error: " + (err.stack || err));
        output.done();
    }

    cxt.end('runOneCommand');
}
