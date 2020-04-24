
import Graph from '../Graph'
import getProcessClient from '../toollib/getProcessClient'
import Minimist from 'minimist'

export default async function runStandardProcess(handler: (graph: Graph) => Promise<void>) {

    const cliArgs = Minimist(process.argv.slice(2));

    let graph;

    if (cliArgs['graph-file']) {
        graph = Graph.loadFromDumpFile(cliArgs['graph-file']);
    } else {
        try {
            graph = await getProcessClient();
        } catch (e) {
            console.error('Failed to connect to server: ' + e);
            process.exitCode = -1;
            return;
        }
    }

    try {
        await handler(graph);
    } catch (e) {
        console.error('Unhandled exception in runStandardProcess')
        console.error(e);
        process.exitCode = -1;
    }

    graph.close();
}
