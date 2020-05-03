
import Graph from '../Graph'
import getProcessClient from '../toollib/getProcessClient'
import ToolShellApi from './ToolShellApi'
import CommandLineToolApi from './CommandLineToolApi'
import Minimist from 'minimist'

export default async function runStandardProcess2(toolName: string, handler: (graph: Graph, api: CommandLineToolApi) => Promise<void>) {

    let graph;

    try {
        graph = await getProcessClient();
    } catch (e) {
        console.error('Failed to connect to server: ' + e);
        process.exitCode = -1;
        return;
    }

    const args = Minimist.parse(process.argv.slice(2));

    const shellApi = new ToolShellApi(graph);
    //for (const input of shellApi.listCliInputs(toolName)) {
    //}

    try {
        const cliApi = new CommandLineToolApi(graph);
        await handler(graph, cliApi);
    } catch (e) {
        console.error('Unhandled exception in runStandardProcess')
        console.error(e);
        process.exitCode = -1;
    }

    graph.close();
}
