
import 'source-map-support'

import Graph from './Graph'
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import { connectToServer } from './socket/ClientConnection'
import Minimist from 'minimist'

async function connectToSocketServer() {
    const client = await connectToServer();

    const repl = new ClientRepl(client);
    repl.start();
}

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {
        boolean: ['generate']
    });

    let graph;
    let useRemoteServer = true;
    let startRepl = false;

    if (cliArgs.f) {
        graph = Graph.loadFromDumpFile(cliArgs.f);
        useRemoteServer = false;
        startRepl = true;
    }

    if (useRemoteServer) {
        console.log('connecting to remote server..')
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
    console.error(err.stack || err);
});
