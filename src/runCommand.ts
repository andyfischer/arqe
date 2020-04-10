
import Graph from './Graph'
import CommandStep from './CommandStep'
import CommandChain from './CommandChain'
import RelationReceiver from './RelationReceiver'
import RelationPipe from './RelationPipe'
import Command from './Command'
import runSearch from './runSearch'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { runJoinStep } from './runJoin'
import runSet from './runSet'
import runModify, { ModifyRequest } from './runModify'
import runDelete from './runDelete'

function runStep(step: CommandStep) {
    try {
        emitCommandOutputFlags(step.command, step.output);

        switch (step.command.commandName) {

        case 'join':
            runJoinStep(step);
            return;

        case 'get':
            runGetStep(step);
            return;
        
        case 'set': {
            runSet(step.graph, step.command.toRelation(), step.output);
            return;
        }

        case 'modify': {
            runModify(step.graph, step.command.toRelation(), step.output);
            return;
        }

        case 'delete': {
            runDelete(step.graph, step.pattern, step.output);
            return;
        }

        case 'listen': {
            step.graph.listen(step);
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

function runGetStep(step: CommandStep) {
    const search = step.toRelationSearch();
    emitSearchPatternMeta(step.command.toPattern(), search);
    runSearch(step.graph, search);
    return;
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
