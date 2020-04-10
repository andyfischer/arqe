
import 'source-map-support'

import Graph from './Graph'
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import CommandConnection from './socket/CommandConnection'
import Minimist from 'minimist'
import { runCodeGenerator } from './CodeGenerator'

async function connectToSocketServer() {
    const ws = new WebSocket('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    ws.on('close', () => {
        console.log('Disconnected from server');
        process.exit();
    });

    const commandConnection = new CommandConnection(ws);

    const repl = new ClientRepl(commandConnection);
    repl.start();
}

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {
        boolean: ['generate']
    });

    let graph;
    let useRemoteServer = true;
    let startRepl = false;

    if (cliArgs.generate) {
        if (!cliArgs.f)
            throw new Error("should use -f with --generate");

        runCodeGenerator(cliArgs.f);
        return;
    }

    if (cliArgs.f) {
        graph = Graph.loadFromDumpFile(cliArgs.f);
        useRemoteServer = false;
        startRepl = true;
    }

    if (useRemoteServer) {
        console.log('connecting to remove server..')
        await connectToSocketServer();
    }

    if (startRepl) {
        const repl = new ClientRepl(graph);
        repl.start();
    }
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
