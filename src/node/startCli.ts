
import Fs from 'fs'
import Path from 'path'
import Glob from 'glob'

import GraphRepl from '../console/Repl'
import printResult from '../console/formatRelation'
import Minimist from 'minimist'
import Tuple from '../Tuple'
import { processGraph } from '../platformExports'
import Graph from '../Graph'
import { startConsoleRepl } from './consoleRepl'
import setupWatchedModules, { loadWatchedTableModule } from './watchedModules'
import TableDefiner from '../TableDefiner'
import SocketServer from './SocketServer'

let _startupLogs = [];

function log(msg: string) {
    _startupLogs.push(msg);
}

function runFile(graph: Graph, filename: string) {
    const contents = Fs.readFileSync(filename, 'utf8');
    throw new Error("parseFile not implemented");
}

function loadStandardTables(graph: Graph) {
    for (const file of Glob.sync(Path.join(__dirname, './tables/*.js'))) {
        log('loading standard file: ' + file);
        loadWatchedTableModule(graph, file);
    }
}

function loadDirectory(graph: Graph, dir: string) {

    const nearbyPatterns = [
        'dist/node/tables/**/*.js',
        'dist/**/*.table.js',
        'dist/**/*.t.js',
        '*.table.js',
        'tables.js',
    ]

    let files = [];

    for (const pattern of nearbyPatterns) {
        files = files.concat(Glob.sync(Path.join(dir, pattern), {
            ignore: ['**/node_modules/**']
        }))
    }

    for (const filename of files) {
        log(`loading file (part of directory ${dir}): ` + filename);
        loadWatchedTableModule(graph, filename);
    }
}

function loadUserSetupJson() {
    const localSetupPath = Path.join(process.env.HOME, ".arqe/local_setup.json");
    if (Fs.existsSync(localSetupPath)) {
        log('found user setup file: ' + localSetupPath);
        return JSON.parse(Fs.readFileSync(localSetupPath, 'utf8'));
    }
    return {};
}

function loadUserSetupDirectories(graph: Graph) {

    const data = loadUserSetupJson();
    const dirs = data.load_directories || [];

    for (const dir of dirs) {
        log('loading dir (from ~/.arqe/local_setup.json): ' + dir);
        loadDirectory(graph, dir);
    }
}

function cliInspectionTable(def: TableDefiner) {
    def.provide('cli startup-log', {
        'find'(i,o) {
            for (const log of _startupLogs)
                o.next({'startup-log': log})
            o.done();
        }
    });
}

function autoloadNearbyTables(graph: Graph) {

    let files = [];

    for (const filename of ['dist/tables.js', '.tables.js', 'tables.js'])
        if (Fs.existsSync(filename))
            files.push(filename);

    files = files.concat(Glob.sync('dist/tables/**/*.js'));
    files = files.concat(Glob.sync('dist/**/*.table.js'));
    files = files.concat(Glob.sync('dist/**/*.t.js'));
    files = files.concat(Glob.sync('*.table.js'));
    files = files.concat(Glob.sync('*.t.js'));

    for (const filename of files) {
        log(`loading file (nearby in cwd): ` + filename);
        loadWatchedTableModule(graph, filename);
    }
}

function autoloadUserDirTables(graph: Graph) {
    let files = [];

    files = files.concat(Glob.sync(Path.join(process.env.HOME, '.arqe/tables/**/*.js'), {
        ignore: ['**/node_modules/**']
    }));

    for (const filename of files) {
        log(`loading file (found in .arqe/tables): ` + filename);
        loadWatchedTableModule(graph, filename);
    }
}

export async function getCliGraph() {
    const graph = processGraph();

    graph.provideWithDefiner(setupWatchedModules);
    graph.provideWithDefiner(cliInspectionTable);
    loadStandardTables(graph);
    autoloadNearbyTables(graph);
    autoloadUserDirTables(graph);
    loadUserSetupDirectories(graph);

    return graph;
}

export default async function main() {
    require('source-map-support').install();

    const cliArgs = Minimist(process.argv.slice(2), {
    });

    const graph = await getCliGraph();

    let runRepl = true;
    let socketServer = null;

    if (cliArgs.c) {

        // add support for --flat ?

        runRepl = false;
        graph.run(cliArgs.c)
        .then(rel => {
            printResult(rel);
            process.exit(0);
        })
        return;
    }

    if (cliArgs.server) {
        socketServer = new SocketServer(graph);
    }

    if (cliArgs._.length > 0) {
        const filename = cliArgs._[0];
        runRepl = false;
        runFile(graph, filename);
    }

    if (runRepl) {
        startConsoleRepl(graph);
    }
}

if (require.main === module) {
    main()
    .catch(err => {
        process.exitCode = -1;
        console.error(err.stack || err);
    });
}
