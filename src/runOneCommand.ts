
import Graph from './Graph'
import Pattern from './Pattern'
import { newTag } from './PatternTag'
import RelationReceiver from './RelationReceiver'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import makeQueryPlan from './makeQueryPlan'
import Command from './Command'
import RelationPipe from './RelationPipe'
import CommandExecutionParams from './CommandExecutionParams'
import { runJoinStep } from './runJoin'
import listenCommand from './listenCommand'
import countCommand from './countCommand'

export function runGet(graph: Graph, pattern: Pattern, output: RelationReceiver) {
    const plan = makeQueryPlan(graph, pattern, output);
    if (!plan.passedValidation)
        return;

    emitSearchPatternMeta(pattern, output);

    if (plan.storageProvider) {
        plan.storageProvider.runSearch(plan.pattern, plan.output);
    } else {
        graph.tupleStore.select(plan);
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
            if (!plan.passedValidation)
                return;

            if (plan.storageProvider) {
                plan.storageProvider.runSave(plan.pattern, plan.output);
            } else {
                graph.tupleStore.save(plan);
            }
            return;
        }

        case 'declare-object': {
            return;
        }

        case 'delete': {

            const deletePattern = pattern.addTagObj(newTag('deleted').setValueExpr(['set']));

            const plan = makeQueryPlan(graph, deletePattern, output);
            if (!plan.passedValidation)
                return;

            if (plan.storageProvider) {
                plan.storageProvider.runSave(deletePattern, plan.output);
            } else {
                graph.tupleStore.save(plan);
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

        }

        emitCommandError(output, "unrecognized command: " + commandName);
        output.finish();

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(output, "internal error: " + (err.stack || err));
        output.finish();
    }
}
