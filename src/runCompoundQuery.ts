
import Graph from './Graph'
import CompoundQuery from './CompoundQuery'
import Stream from './Stream'
import Pipe from './Pipe'
import CommandParams from './CommandParams'
import { emitCommandError } from './CommandMeta'
import runOneCommand from './runOneCommand'
import { ValidCommands } from './CommandDb'
import QueryContext from './QueryContext'

export default function runCompoundQuery(graph: Graph, chain: CompoundQuery, output: Stream) {

    if (!graph)
        throw new Error('Graph is null');

    const cxt = new QueryContext(graph);

    cxt.start('runCompoundQuery', { compoundQuery: chain.stringify() })

    if (chain.queries.length === 0) {
        output.done();
        cxt.msg('early exit - no queries')
        cxt.end('runCompoundQuery');
        return;
    }

    // Initial error checking
    for (const command of chain.queries) {
        if (!ValidCommands[command.verb]) {
            emitCommandError(output, "unrecognized command: " + command.verb);
            cxt.msg('early exit - invalid command')
            cxt.end('runCompoundQuery');
            output.done();
            return;
        }
    }

    // Set up CommandExecutionParam objects with pipe objects. The 'output' of one step is the 'input' of
    // the next step.
    
    const steps: CommandParams[] = [];
    
    for (const command of chain.queries) {
        steps.push({
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
        runOneCommand(cxt, step);

    cxt.end('runCompoundQuery');
}
