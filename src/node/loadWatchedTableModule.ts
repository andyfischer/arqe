
import Path from 'path'
import Fs from 'fs'
import Graph from '../Graph'
import TableMount from '../TableMount'
import debounce from '../utils/debounce'
import { toTuple } from '../coerce'
import TableDefiner from '../TableDefiner'
import Glob from 'glob'

export function prepareForWatchedModules(graph: Graph) {
    graph.provide({
        'watched-table-modules loaded filename': 'memory'
    });
}

export default function loadWatchedTableModule(graph: Graph, filename: string) {

    filename = Path.resolve(filename);

    //console.log('loadWatchedTableModule check:')
    //console.log(graph.runSyncRelation(toTuple(['get', 'watched-table-modules', 'loaded', { filename }])).stringify())

    if (graph.runSyncRelation(toTuple(['get', 'watched-table-modules', 'loaded', { filename }])).bodyArray().length > 0) {
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

    //console.log('saved:')
    //console.log(graph.runSyncRelation(toTuple(['get', 'watched-table-modules', 'loaded', { filename }])).stringify())

    const reload = debounce(250, reloadNow);

    reloadNow();

    Fs.watch(filename, reload);
}

export function loadWatchedTableDir(graph: Graph, dir: string) {
    const files = Glob.sync(Path.join(dir, '**/*.js'));
    for (const file of files)
        loadWatchedTableModule(graph, file);
}
