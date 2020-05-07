
import Graph from './Graph'
import CommandStep from './CommandStep'
import CommandChain from './CommandChain'
import RelationReceiver from './RelationReceiver'
import RelationPipe from './RelationPipe'
import Command from './Command'
import runSearch from './runSearch'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { runJoinStep } from './runJoin'
import runSave from './runSave'
import runListen from './runListen'
import { newRelationSearch } from './SearchOperation'
import { newTag } from './PatternTag'

const knownCommands = {
    'join': true,
    'get': true,
    'set': true,
    'delete': true,
    'listen': true
};

function runStep(step: CommandStep) {
    try {
        emitCommandOutputFlags(step.command, step.output);

        switch (step.command.commandName) {

        case 'join':
            runJoinStep(step);
            return;

        case 'get': {
            emitSearchPatternMeta(step.command.pattern, step.output);
            runSearch(newRelationSearch(step.graph, step.command.pattern, step.output));
            return;
        }
        
        case 'set': {
            runSave({graph: step.graph, relation: step.command.toRelation(), output: step.output});
            return;
        }

        case 'delete': {
            let relation = step.pattern;
            relation = relation.addTagObj(newTag('deleted').setValueExpr(['set']));
            runSave({graph: step.graph, relation, output: step.output});
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
