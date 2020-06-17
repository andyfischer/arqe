
import Graph from './Graph'
import CommandStep from './CommandStep'
import CommandChain from './CommandChain'
import TupleReceiver from './TupleReceiver'
import RelationPipe from './RelationPipe'
import Command from './Command'
import { emitSearchPatternMeta, emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { runJoinStep } from './runJoin'
import { newTupleSearch } from './SearchOperation'
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
    'declare-object': true
};

export function singleCommandExecution(graph: Graph, command: Command): CommandStep {
    const step = new CommandStep(graph, command);
    step.input = new RelationPipe();
    step.input.done();
    step.output = new RelationPipe();
    return step;
}

export default function runCommandChain(graph: Graph, chain: CommandChain, output: TupleReceiver) {

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
        step.input = (steps.length === 0) ? new RelationPipe() : steps[steps.length - 1].output;
        step.output = new RelationPipe();
        steps.push(step);
    }

    // The first input pipe has no data.
    steps[0].input.done();

    // Last pipe sends to output.
    steps[steps.length - 1].output.pipeToReceiver(output);

    // Start
    for (const step of steps)
        runOneCommand(step);
}
