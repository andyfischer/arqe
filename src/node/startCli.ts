
import Fs from 'fs'
import Path from 'path'

import GraphRepl from '../GraphRepl'
import printResult from '../console/printResult'
import Minimist from 'minimist'
import Tuple from '../Tuple'
import { receiveToTupleList, receiveToTupleListPromise } from '../receiveUtils'
import { processGraph } from '../platformExports'
import Graph from '../Graph'
import loadWatchedTableModule from './loadWatchedTableModule'
import startRepl from './startRepl'

// import WebServer from './node/socket/WebServer'
// import loadBootstrapConfigs, { loadLocalBootstrapConfigs } from './loadBootstrapConfigs'

function runFile(graph: Graph, filename: string) {
    const contents = Fs.readFileSync(filename, 'utf8');
    throw new Error("parseFile not implemented");
    /*
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
    */
}

function requireTables(graph: Graph, moduleName: string) {
    console.log('loading: ' + moduleName);
    const { setupTables } = require(moduleName);
    if (!setupTables)
        throw new Error(`Module '${moduleName}' didn't export 'setupTables'`);

    const tables = setupTables();

    for (const table of tables)
        graph.addTable(table);
}

function loadStandardTables(graph: Graph) {
    loadWatchedTableModule(graph, Path.join(__dirname, 'standardTables.js'));
}

function autoloadNearbyTables(graph: Graph) {
    for (const filename of ['dist/tables.js']) {
        if (Fs.existsSync(filename)) {
            console.log('autoloading: ' + filename);
            loadWatchedTableModule(graph, filename);
        }
    }
}

export default async function main() {
    require('source-map-support').install();

    const cliArgs = Minimist(process.argv.slice(2), {
    });

    // Set up file-path and file-path-ref tables
    // Set up 'cwd' and 'projectHome' entries
    // Mount schema.json

    const graph = processGraph();

    /*
    if (cliArgs.db) {
        loadBootstrapConfigs(graph, cliArgs.db);
    } else {
        loadLocalBootstrapConfigs(graph);
    }
    */


    loadStandardTables(graph);
    autoloadNearbyTables(graph);

    let runRepl = true;

    // load schema with JsonFile

    if (cliArgs.server) {
        console.log('--server not supported');
        // const server = new WebServer(graph);
        // await server.start();
    }

    if (cliArgs.c) {

        const [ receiver, promise ] = receiveToTupleListPromise();
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
        startRepl(graph);
    }
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err.stack || err);
});
