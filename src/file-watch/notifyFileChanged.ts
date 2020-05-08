
import Path from 'path'
import WatchFileApi from './WatchFileApi'
import runStandardProcess from '../toollib/runStandardProcess'
import getProcessClient from '../toollib/getProcessClient'
import Graph from '../Graph'
import GraphLike from '../GraphLike'

export async function notifyFileChanged(graph: GraphLike, filename: string) {

    filename = Path.resolve(filename);
    const api = new WatchFileApi(graph);
    if ((await api.findWatchesForFilename(filename)).length === 0)
        await api.createWatch(filename);
    else
        await api.incrementVersion(filename);
}

export function main() {

    setTimeout(() => {
        console.log('timed out');
        process.exit(-1);
    }, 250);

    runStandardProcess(async (graph: Graph) => {
        let filename = process.argv[2];

        if (!filename) {
            console.log('Expected filename argument');
            process.exitCode = -1;
            return;
        }

        await notifyFileChanged(graph, filename);
    });
}

