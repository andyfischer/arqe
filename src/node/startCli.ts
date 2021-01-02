
import Fs from 'fs'
import Path from 'path'
import Glob from 'glob'

import GraphRepl from '../GraphRepl'
import printResult from '../console/printResult'
import Minimist from 'minimist'
import Tuple from '../Tuple'
import { receiveToTupleList, receiveToTupleListPromise } from '../receiveUtils'
import { processGraph } from '../platformExports'
import Graph from '../Graph'
import startRepl from './startRepl'
import setupWatchedModules, { loadWatchedTableModule } from './watchedModules'

// import WebServer from './node/socket/WebServer'
// import loadBootstrapConfigs, { loadLocalBootstrapConfigs } from './loadBootstrapConfigs'

function runFile(graph: Graph, filename: string) {
    const contents = Fs.readFileSync(filename, 'utf8');
    throw new Error("parseFile not implemented");
}

function loadStandardTables(graph: Graph) {
    for (const file of Glob.sync(Path.join(__dirname, '../tables/*.js')))
        loadWatchedTableModule(graph, file);

    loadWatchedTableModule(graph, Path.join(__dirname, 'standardTables.js'));
}

function autoloadNearbyTables(graph: Graph) {

    let files = [];

    for (const filename of ['dist/tables.js', '.tables.js', 'tables.js'])
        if (Fs.existsSync(filename))
            files.push(filename);

    files = files.concat(Glob.sync('dist/tables/**/*.js'));
    files = files.concat(Glob.sync('dist/**/*.table.js'));
    files = files.concat(Glob.sync(Path.join(process.env.HOME, '.arqe/tables/**/*.js'), {
        ignore: ['**/node_modules/**']
    }));

    for (const filename of files) {
        console.log('autoloading: ' + filename);
        loadWatchedTableModule(graph, filename);
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

    graph.provideWithDefiner(setupWatchedModules);
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

        runRepl = false;
        graph.run(cliArgs.c)
        .then(rel => {
            printResult(rel);
            process.exit(0);
        })
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
