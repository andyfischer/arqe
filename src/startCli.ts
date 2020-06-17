
import Fs from 'fs'
import Path from 'path'
import Graph from './Graph'
import GraphRepl from './GraphRepl'
import printResult from './console/printResult'
import Repl from 'repl'
import { connectToServer } from './socket/ClientConnection'
import Minimist from 'minimist'
import loadGraphFromFiles from './loadGraphFromFiles'
import { parseFile } from './parseCommand'
import Tuple from './Tuple'
import { receiveToTupleList, receiveToTupleListPromise } from './receiveUtils'
import WebServer from './socket/WebServer'
import loadGraphFromLocalDatabase from './loadGraphFromLocalDatabase'

function runFile(graph: Graph, filename: string) {
    const contents = Fs.readFileSync(filename, 'utf8');
    const commands = parseFile(contents);
    for (const command of commands) {

        const listReceiver = receiveToTupleList((rels: Tuple[]) => {
            printResult(rels);
        });

        graph.run(command.stringify(), {
            next(relation) {
                if (relation.hasAttr('command-meta') && relation.hasAttr('search-pattern'))
                    return;

                listReceiver.next(relation);
            },
            done() {
                listReceiver.done();
            }
        });
    }
}

export default async function main() {
    require('source-map-support').install();

    const cliArgs = Minimist(process.argv.slice(2), {
    });

    let graph;
    let useRemoteServer = false;
    let runRepl = true;

    if (cliArgs.connect) {
        console.log('connecting to remote server..')
        const port = process.env.PORT || '42940'
        graph = await connectToServer(port);
    } else {
        if (cliArgs.server) {
            graph = loadGraphFromLocalDatabase();
            const server = new WebServer(graph);
            await server.start();
        }

        if (cliArgs.db) {
            graph = loadGraphFromFiles(cliArgs.db);
        } else {
            graph = loadGraphFromLocalDatabase();
        }
    }

    if (cliArgs.c) {

        const { promise, receiver } = receiveToTupleListPromise();
        graph.run(cliArgs.c, receiver);

        const rels = await promise;
        printResult(rels);
        runRepl = false;
        graph.close();
        process.exit(0);
        return;
    }

    if (cliArgs._.length > 0) {
        const filename = cliArgs._[0];
        runRepl = false;
        runFile(graph, filename);
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
