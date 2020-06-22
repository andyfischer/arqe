
import Graph from './Graph'
import Pattern from './Pattern'
import { newTag } from './PatternTag'
import Stream from './Stream'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import makeQueryPlan from './makeQueryPlan'
import Command from './Command'
import CommandExecutionParams from './CommandExecutionParams'
import { runJoinStep } from './runJoin'
import listenCommand from './listenCommand'
import countCommand from './countCommand'
import orderByCommand from './commands/orderBy'

export function runGet(graph: Graph, pattern: Pattern, output: Stream) {
    const plan = makeQueryPlan(graph, pattern, output);
    if (plan.failed)
        return;

    emitSearchPatternMeta(pattern, output);

    if (plan.storageProvider) {
        plan.storageProvider.runSearch(plan.tuple, plan.output);
    } else {
        graph.select(plan);
    }
}

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
            runGet(graph, pattern, output);
            return;
        }
        
        case 'set': {
            const plan = makeQueryPlan(graph, pattern, output);
            if (plan.failed)
                return;

            if (plan.storageProvider) {
                plan.storageProvider.runSave(plan.tuple, plan.output);
            } else {
                graph.save(plan);
            }
            return;
        }

        case 'declare-object': {
            return;
        }

        case 'delete': {

            const deletePattern = pattern.addTagObj(newTag('deleted').setValueExpr(['set']));

            const plan = makeQueryPlan(graph, deletePattern, output);
            if (plan.failed)
                return;

            if (plan.storageProvider) {
                plan.storageProvider.runSave(deletePattern, plan.output);
            } else {
                graph.save(plan);
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

        }

        emitCommandError(output, "unrecognized command: " + commandName);
        output.done();

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(output, "internal error: " + (err.stack || err));
        output.done();
    }
}
