
import loadGraphFromFiles from './loadGraphFromFiles'
import Path from 'path'

export default function loadGraphFromLocalDatabase() {
    const graph = loadGraphFromFiles(Path.join(__dirname, '../src/db'));
    return graph;
}
