
import Graph from './Graph'
import CommandStep from './CommandStep'
import CommandChain from './CommandChain'
import RelationReceiver from './RelationReceiver'
import RelationPipe from './RelationPipe'
import Command from './Command'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { runJoinStep } from './runJoin'
import runListen from './runListen'
import { newRelationSearch } from './SearchOperation'
import { newTag } from './PatternTag'
import makeQueryPlan from './makeQueryPlan'

const knownCommands = {
    'join': true,
    'get': true,
    'set': true,
    'delete': true,
    'listen': true,
    'declare-object': true
};

function runStep(step: CommandStep) {

    const graph = step.graph;
    const pattern = step.command.pattern;
    const output = step.output;

    try {
        emitCommandOutputFlags(step.command, step.output);

        switch (step.command.commandName) {

        case 'join':
            runJoinStep(step);
            return;

        case 'get': {
            const plan = makeQueryPlan(graph, pattern, output);
            if (!plan.passedValidation)
                return;

            emitSearchPatternMeta(pattern, step.output);
            graph.tupleStore.select(plan);
            return;
        }
        
        case 'set': {
            step.graph.database.save(step.command.toRelation(), step.output);
            return;
        }

        case 'declare-object': {
            return;
        }

        case 'delete': {
            let relation = step.pattern;
            relation = relation.addTagObj(newTag('deleted').setValueExpr(['set']));
            step.graph.database.save(relation, step.output);
            return;
        }

        case 'listen': {
            runListen(step.graph, step);
            return;
        }
        }

        emitCommandError(step.output, "unrecognized command: " + step.commandName);
        step.output.finish();

    } catch (err) {
        console.log(err.stack || err);
        emitCommandError(step.output, "internal error: " + (err.stack || err));
        step.output.finish();
    }
}

export function singleCommandExecution(graph: Graph, command: Command): CommandStep {
    const step = new CommandStep(graph, command);
    step.input = new RelationPipe();
    step.input.finish();
    step.output = new RelationPipe();
    return step;
}

export function runCommandChain(graph: Graph, chain: CommandChain, output: RelationReceiver) {

    if (!graph)
        throw new Error('graph is null');

    if (chain.commands.length === 0) {
        output.finish();
        return;
    }

    // Initial error checking
    for (const command of chain.commands) {
        if (!knownCommands[command.commandName]) {
            emitCommandError(output, "unrecognized command: " + command.commandName);
            output.finish();
            return;
        }
    }

    // Set up CommandStep objects with pipe objects. The 'output' of one step is the 'input' of
    // the next step.
    
    const steps:CommandStep[] = [];
    
    for (const command of chain.commands) {
        const step = new CommandStep(graph, command);
        step.input = (steps.length === 0) ? new RelationPipe() : steps[steps.length - 1].output;
        step.output = new RelationPipe();
        steps.push(step);
    }

    // The first input pipe has no data.
    steps[0].input.finish();

    // Last pipe sends to output
    steps[steps.length - 1].output.pipeToReceiver(output);

    // Start
    for (const step of steps)
        runStep(step);
}
