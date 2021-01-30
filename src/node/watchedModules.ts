
import TableDefiner from '../TableDefiner'
import Path from 'path'
import Fs from 'fs'
import Graph from '../Graph'
import TableMount from '../TableMount'
import debounce from '../utils/debounce'
import { toTuple } from '../coerce'
import Glob from 'glob'

export default function graphSetup(def: TableDefiner) {
    def.provide('watched-table-modules loaded filename', 'memory');

    def.provide('reload-all-modules', {
        find(i,o) {
        }
    });
}

export function loadWatchedTableModule(graph: Graph, filename: string) {

    filename = Path.resolve(filename);

    if (graph.run(toTuple(['get', 'watched-table-modules', 'loaded', { filename }])).rel().bodyArr().length > 0) {
        // console.log("filename already watched: " + filename);
        return;
    }

    let mounted = false;
    let definer = new TableDefiner();
    let lastMtime;

    function reloadNow() {
        const mtime = Fs.statSync(filename).mtime.valueOf();

        if (mtime === lastMtime)
            return;

        lastMtime = mtime;

        if (mounted) {
            mounted = false;
            definer.unmount(graph);
            console.log('reloading: ' + filename);
        }

        const resolvedFilename = require.resolve(filename);
        const existingModule = require.cache[resolvedFilename];
        delete require.cache[resolvedFilename];

        try {
            const contents = require(filename);
            const def = contents.default || contents;

            if (typeof def === 'function')
                def(definer);
            else
                definer.provideSet(def);

            definer.mount(graph);
            mounted = true;

        } catch (err) {
            console.log(`Failed to load module: ${filename}\n${err.stack || err}`);

            // restore previous module
            require.cache[resolvedFilename] = existingModule;
        }
    }

    graph.runSync(toTuple(['set', 'watched-table-modules', 'loaded', { filename }]));

    const reload = debounce(250, reloadNow);

    reloadNow();

    Fs.watch(filename, reload);
}

export function loadWatchedTableDir(graph: Graph, dir: string) {
    const files = Glob.sync(Path.join(dir, '**/*.js'));
    for (const file of files)
        loadWatchedTableModule(graph, file);
}

export function loadWatchedTableGlob(graph: Graph, pattern) {
    const files = Glob.sync(pattern);
    for (const file of files)
        loadWatchedTableModule(graph, file);
}
