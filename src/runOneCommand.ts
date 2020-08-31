
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

function handleCommandContextTags(cxt: QueryContext, params: CommandParams) {
    if (params.command.pattern.hasAttr("debug.dumpTrace")) {
        cxt.enableDebugDumpTrace = true;
        params.command.pattern = params.command.pattern.removeAttr("debug.dumpTrace");
    }
}

export default function runOneCommand(parentCxt: QueryContext, params: CommandParams) {

    const cxt = new QueryContext(parentCxt.graph);

    handleCommandContextTags(cxt, params);

    const { command, output } = params;

    cxt.callingQuery = command;
    cxt.input = params.input;

    const commandName = command.verb;
    cxt.start("runOneCommand", { commandName, query: command.stringify() })

    try {
        emitCommandOutputFlags(command, output);

        switch (commandName) {

        case 'join':
            runJoinStep(cxt, params);
            break;

        case 'just':
            runJustStep(params);
            break;

        case 'get': {
            getCommand(cxt, command.pattern, output);
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

        default: {
            emitCommandError(output, "unrecognized command: " + commandName);
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
