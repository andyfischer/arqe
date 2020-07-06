
import Graph from './Graph'
import Pattern from './Pattern'
import { newTag } from './PatternTag'
import Stream from './Stream'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import planQuery from './planQuery'
import Command from './Command'
import CommandExecutionParams from './CommandExecutionParams'
import { runJoinStep } from './runJoin'
import listenCommand from './listenCommand'
import countCommand from './commands/count'
import orderByCommand from './commands/orderBy'
import watchCommand from './commands/watch'
import setCommand from './commands/set'
import getCommand from './commands/get'
import { del } from './tableOperations'

export default function runOneCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    const commandName = command.commandName;
    const pattern = command.pattern;

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

            const deletePattern = pattern.addTagObj(newTag('deleted').setValueExpr(['set']));

            const plan = planQuery(graph, deletePattern, output);
            if (plan.failed)
                return;

            if (plan.storageProvider) {
                plan.storageProvider.runSave(deletePattern, plan.output);
            } else {
                del(graph, plan);
            }

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
