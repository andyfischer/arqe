
/*
import Graph from '../Graph'
import getProcessClient from './getProcessClient'
import ToolShellApi from './generated/ToolShellApi'
import CommandLineToolApi from './generated/CommandLineToolApi'
import Minimist from 'minimist'

export default async function runStandardProcess(toolName: string, handler: (graph: Graph, api: CommandLineToolApi) => Promise<void>) {

    require('source-map-support').install();

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
    const execId = await shellApi.createToolExecution();

    process.on('unhandledRejection', (error:any) => {
        console.error(`unhandledRejection during ${execId}: `, (error.stack || error));
    });

    process.on('SIGINT', () => {
        graph.close();
        process.exit();
    });

    for (const input of await shellApi.listCliInputs(toolName)) {
        if (args[input]) {
            await shellApi.setCliInput(execId, input, args[input]);
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
        cliApi.execId = execId;

        await handler(graph, cliApi);
    } catch (e) {
        console.error('Unhandled exception in runStandardProcess')
        console.error(e);
        process.exitCode = -1;
    }

    graph.close();
}
*/
