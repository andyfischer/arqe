
import 'source-map-support'

import Graph from './Graph'
import GraphRepl from './GraphRepl'
import Repl from 'repl'
import { connectToServer } from './socket/ClientConnection'
import Minimist from 'minimist'

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {
        boolean: ['generate']
    });

    let graph;
    let useRemoteServer = true;

    if (cliArgs.f) {
        graph = Graph.loadFromDumpFile(cliArgs.f);
        useRemoteServer = false;
    }

    if (useRemoteServer) {
        console.log('connecting to remote server..')
        graph = await connectToServer();
    }

    const graphRepl = new GraphRepl(graph);

    const repl = Repl.start({
        prompt: '~ ',
        eval: line => graphRepl.eval(line, () => {
            repl.displayPrompt()
        })
    });

    repl.on('exit', () => {
        process.exit(0);
    });
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err.stack || err);
});
