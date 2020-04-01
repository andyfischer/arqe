
import Graph from './Graph'
import CommandStep from './CommandStep'
import CommandChain from './CommandChain'
import RelationReceiver from './RelationReceiver'
import RelationPipe from './RelationPipe'
import Command from './Command'
import { runSearch } from './Search'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { runJoinStep } from './JoinCommand'

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
            runSetStep(step.graph, step);
            return;
        }

        case 'modify': {
            return;
        }

        case 'delete': {
            step.graph.deleteCmd(step);
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

function runSetStep(graph: Graph, commandExec: CommandStep) {
    const command = commandExec.command;
    const output = commandExec.output;

    if (!command)
        throw new Error('missing commandExec.command');

    // Validate
    for (const tag of command.tags) {
        if (tag.starValue || tag.star || tag.doubleStar) {
            emitCommandError(output, "can't use star pattern in 'set'");
            commandExec.output.finish();
            return;
        }
    }

    graph.inMemory.runSave(command, {
        relation: (rel) => {
            graph.onRelationUpdated(command, rel);
            output.relation(rel);
        },
        finish: () => {
            output.finish()
        },
        isDone: () => false
    });
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
