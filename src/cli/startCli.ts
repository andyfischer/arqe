
import 'source-map-support'
import Graph from '../Graph'
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import CommandConnection from '../socket/CommandConnection'
import Minimist from 'minimist'

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

function loadFromDumpFile(filename: string) {
    const graph = new Graph();
    graph.loadDumpFile(filename);

    const repl = new ClientRepl(graph);
    repl.start();
}

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {});

    if (cliArgs.f) {
        loadFromDumpFile(cliArgs.f);
        return;
    }

    await connectToSocketServer();
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
