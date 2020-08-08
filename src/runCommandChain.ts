
import Graph from './Graph'
import CompoundQuery from './CompoundQuery'
import Stream from './Stream'
import Pipe from './Pipe'
import CommandExecutionParams from './CommandExecutionParams'
import { emitCommandError } from './CommandMeta'
import runOneCommand from './runOneCommand'
import { ValidCommands } from './CommandDb'

export default function runCommandChain(graph: Graph, chain: CompoundQuery, output: Stream) {

    if (!graph)
        throw new Error('Graph is null');

    if (chain.queries.length === 0) {
        output.done();
        return;
    }

    // Initial error checking
    for (const command of chain.queries) {
        if (!ValidCommands[command.commandName]) {
            emitCommandError(output, "unrecognized command: " + command.commandName);
            output.done();
            return;
        }
    }

    // Set up CommandExecutionParam objects with pipe objects. The 'output' of one step is the 'input' of
    // the next step.
    
    const steps: CommandExecutionParams[] = [];
    
    for (const command of chain.queries) {
        steps.push({
            graph,
            command,
            input: (steps.length === 0) ? new Pipe() : steps[steps.length - 1].output,
            output: new Pipe()
        });
    }

    // The first input pipe has no data.
    steps[0].input.done();

    // Last pipe sends to output.
    steps[steps.length - 1].output.sendTo(output);

    // Start
    for (const step of steps)
        runOneCommand(step);
}
