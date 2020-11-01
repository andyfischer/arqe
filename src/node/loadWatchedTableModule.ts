
import Path from 'path'
import Fs from 'fs'
import Graph from '../Graph'
import TableMount from '../TableMount'
import debounce from '../utils/debounce'

export default function loadWatchedTableModule(graph: Graph, filename: string) {

    filename = Path.resolve(filename);
    let mounted: TableMount[];
    let lastMtime;

    function reloadNow() {
        const mtime = Fs.statSync(filename).mtime.valueOf();

        if (mtime === lastMtime)
            return;

        lastMtime = mtime;

        if (mounted) {
            graph.removeTables(mounted);
            console.log('reloading: ' + filename);
        }

        delete require.cache[require.resolve(filename)];
        const contents = require(filename);
        const def = contents.default || contents;
        mounted = graph.provide(def);
    }

    const reload = debounce(250, reloadNow);

    reloadNow();

    Fs.watch(filename, reload);

}
