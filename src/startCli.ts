
import Graph from './Graph'
import GraphRepl from './GraphRepl'
import Repl from 'repl'
import { connectToServer } from './socket/ClientConnection'
import Minimist from 'minimist'
import loadGraphFromFiles from './loadGraphFromFiles'

export default async function main() {
    require('source-map-support').install();

    const cliArgs = Minimist(process.argv.slice(2), {
    });

    let graph;
    let useRemoteServer = true;
    let runRepl = true;

    if (cliArgs.db) {
        graph = loadGraphFromFiles(cliArgs.db);
        useRemoteServer = false;
    }

    if (useRemoteServer) {
        console.log('connecting to remote server..')
        graph = await connectToServer();
    }

    if (cliArgs._.length > 0) {
        const filename = cliArgs._[0];
        console.log('running file: ', filename);
    }

    if (runRepl) {
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
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err.stack || err);
});
