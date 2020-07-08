
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import CommandExecutionParams from './CommandExecutionParams'
import { runJoinStep } from './runJoin'
import listenCommand from './commands/listen'
import countCommand from './commands/count'
import orderByCommand from './commands/orderBy'
import watchCommand from './commands/watch'
import setCommand from './commands/set'
import getCommand from './commands/get'
import deleteCommand from './commands/delete'

export default function runOneCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const commandName = command.commandName;

    try {
        emitCommandOutputFlags(command, output);

        switch (commandName) {

        case 'join':
            runJoinStep(params);
            return;

        case 'get': {
            getCommand(graph, command.pattern, output);
            return;
        }
        
        case 'set': {
            setCommand(params);
            return;
        }

        case 'declare-object': {
            return;
        }

        case 'delete': {
            deleteCommand(params);
            return;
        }

        case 'listen': {
            listenCommand(params);
            return;
        }

        case 'count': {
            countCommand(params);
            return;
        }

        case 'order-by': {
            orderByCommand(params);
            return;
        }

        case 'watch': {
            watchCommand(params);
            return;
        }

        }

        emitCommandError(output, "unrecognized command: " + commandName);
        output.done();

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(output, "internal error: " + (err.stack || err));
        output.done();
    }
}
