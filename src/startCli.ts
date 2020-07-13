
import Fs from 'fs'
import Path from 'path'
import os from 'os'
import Graph from './Graph'
import GraphRepl from './GraphRepl'
import printResult from './console/printResult'
import Repl from 'repl'
import { connectToServer } from './socket/ClientConnection'
import Minimist from 'minimist'
import { parseFile } from './parseCommand'
import Tuple from './Tuple'
import { receiveToTupleList, receiveToTupleListPromise } from './receiveUtils'
import WebServer from './socket/WebServer'
import loadBootstrapConfigs, { loadLocalBootstrapConfigs } from './loadBootstrapConfigs'

function runFile(graph: Graph, filename: string) {
    const contents = Fs.readFileSync(filename, 'utf8');
    const commands = parseFile(contents);
    for (const command of commands) {

        const listReceiver = receiveToTupleList((rels: Tuple[]) => {
            printResult(rels);
        });

        graph.run(command.stringify(), {
            next(tuple) {
                if (tuple.hasAttr('command-meta')) {
                    if (tuple.hasAttr('search-pattern'))
                        return;

                    console.log('# ' + tuple.removeAttr('command-meta').stringify());
                }

                listReceiver.next(tuple);
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

    // Set up file-path and file-path-ref tables
    // Set up 'cwd' and 'projectHome' entries
    // Mount schema.json

    const graph = new Graph();

    if (cliArgs.db) {
        loadBootstrapConfigs(graph, cliArgs.db);
    } else {
        loadLocalBootstrapConfigs(graph);
    }

    let runRepl = true;

    // load schema with JsonFile

    if (cliArgs.server) {
        const server = new WebServer(graph);
        await server.start();
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

        try {
            repl.setupHistory(Path.join(os.homedir(), '.arqe_history'), () => {});
        } catch (e) { }

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
