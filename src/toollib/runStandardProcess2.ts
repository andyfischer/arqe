
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

    const args = Minimist(process.argv.slice(2));
    let failedLaunch = false;

    const shellApi = new ToolShellApi(graph);
    for (const input of await shellApi.listCliInputs(toolName)) {
        console.log('tool uses input: ' + input);

        if (args[input]) {
            // await shellApi.setCliInput(input, args[input]);
        }

        if (await shellApi.cliInputIsRequired(toolName, input)) {
            if (!args[input]) {
                console.log('Missing required param: --' + input);
                failedLaunch = true;
            }
        }
    }

    if (failedLaunch) {
        process.exit(-1);
    }

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