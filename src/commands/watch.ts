
import Graph from '../Graph'
import CommandExecutionParams from '../CommandExecutionParams'
import Tuple, { objectToTuple } from '../Tuple'

function createWatchCommand(graph: Graph, pattern: Tuple) {
    const res = graph.runSync(`set watch((unique)) pattern(${pattern.stringify()})`)[0];
    console.log('res = ', res.stringify());
}

export default function watchCommand(params: CommandExecutionParams) {
    const { graph, output } = params;
    const pattern = params.command.pattern;

    output.next(objectToTuple({ 'command-meta': true, 'watch': true }));

    createWatchCommand(graph, pattern);

    output.done();
}
