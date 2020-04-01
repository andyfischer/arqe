
import Graph from './Graph'
import CommandExecution from './CommandExecution'
import CommandChain from './CommandChain'
import RelationReceiver, { receiveToNull } from './RelationReceiver'
import RelationPipe from './RelationPipe'
import Command from './Command'
import { runSearch } from './Search'
import { emitSearchPatternMeta, emitCommandError, emitActionPerformed, emitCommandOutputFlags } from './CommandMeta'
import { runSetOperation } from './SetOperation'

import { runJoinStep } from './JoinCommand'

function runStep(step: CommandExecution) {
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
            runSetOperation(step.graph, step);
            return;
        }

        case 'modify': {
            return;
        }

        case 'dump': {
            for (const rel of step.graph.inMemory.everyRelation()) {
                step.output.relation(rel);
            }
            step.output.finish();
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

function runGetStep(step: CommandExecution) {
    const search = step.toRelationSearch();
    emitSearchPatternMeta(step.command.toPattern(), search);
    runSearch(step.graph, search);
    return;
}

export function singleCommandExecution(graph: Graph, command: Command): CommandExecution {
    const step = new CommandExecution(graph, command);
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

    // Set up CommandExecution objects with pipe objects. The 'output' of one step is the 'input' of
    // the next step.
    
    const steps:CommandExecution[] = [];
    
    for (const command of chain.commands) {
        const step = new CommandExecution(graph, command);
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

    /*
    // Set up commands
    const commandExecs = chain.commands.map(command => {
        const exec = new CommandExecution(graph, command);
        setupCommandExecution(exec);
        return exec;
    });

    // Link up commands
    for (let index = 0; index < commandExecs.length; index++) {
        const isFirst = index == 0;
        const isLast = index == commandExecs.length - 1;
        const commandExec = commandExecs[index];

        if (isLast)
            commandExec.outputTo(output);

        if (!isLast) {
            const next = commandExecs[index + 1];
            if (!next.input) {
                commandExec.outputTo(receiveToNull());
                continue;
            }

            commandExec.outputTo(next.input);
        }
    }

    // Launch
    for (const commandExec of commandExecs) {
        graph.runCommandExecution(commandExec);
    }
    */
}
