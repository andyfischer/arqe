
import Graph from '../Graph'
import getProcessClient from '../toollib/getProcessClient'

export default async function runStandardProcess(handler: (graph: Graph) => Promise<void>) {

    let graph;

    try {
        graph = await getProcessClient();
    } catch (e) {
        console.error('Failed to connect to server: ' + e);
        process.exitCode = -1;
        return;
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
