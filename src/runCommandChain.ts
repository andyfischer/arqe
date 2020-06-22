
import Graph from './Graph'
import CommandStep from './CommandStep'
import CommandChain from './CommandChain'
import Stream from './Stream'
import Pipe from './Pipe'
import Command from './Command'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { runJoinStep } from './runJoin'
import { newTag } from './PatternTag'
import makeQueryPlan from './makeQueryPlan'
import runOneCommand from './runOneCommand'

const knownCommands = {
    'join': true,
    'get': true,
    'set': true,
    'count': true,
    'delete': true,
    'listen': true,
    'order-by': true
};

export function singleCommandExecution(graph: Graph, command: Command): CommandStep {
    const step = new CommandStep(graph, command);
    step.input = new Pipe();
    step.input.done();
    step.output = new Pipe();
    return step;
}

export default function runCommandChain(graph: Graph, chain: CommandChain, output: Stream) {

    if (!graph)
        throw new Error('graph is null');

    if (chain.commands.length === 0) {
        output.done();
        return;
    }

    // Initial error checking
    for (const command of chain.commands) {
        if (!knownCommands[command.commandName]) {
            emitCommandError(output, "unrecognized command: " + command.commandName);
            output.done();
            return;
        }
    }

    // Set up CommandStep objects with pipe objects. The 'output' of one step is the 'input' of
    // the next step.
    
    const steps:CommandStep[] = [];
    
    for (const command of chain.commands) {
        const step = new CommandStep(graph, command);
        step.input = (steps.length === 0) ? new Pipe() : steps[steps.length - 1].output;
        step.output = new Pipe();
        steps.push(step);
    }

    // The first input pipe has no data.
    steps[0].input.done();

    // Last pipe sends to output.
    steps[steps.length - 1].output.sendTo(output);

    // Start
    for (const step of steps)
        runOneCommand(step);
}
