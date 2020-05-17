
import Path from 'path'
import Graph from '../Graph'
import WatchFileApi from './WatchFileApi'
import getProcessClient from '../toollib/getProcessClient'
import runStandardProcess from '../toollib/runStandardProcess'

export default async function watchFile(filename: string, callback: (version: string) => void) {
    const graph = await getProcessClient();

    filename = Path.resolve(filename);

    const api = new WatchFileApi(graph);

    let watch = await api.findFileWatch(filename);
    if (!watch) {
        watch = await api.createWatch(filename);
    }

    api.listenToFile(watch, callback);
}

export async function main() {
    runStandardProcess('watch-file', async (graph: Graph) => {
        const filename = process.argv[2];

        watchFile(filename, (version) => {
            console.log(`file ${filename} changed: ` + version);
        })
        .catch(console.error);

        await new Promise((resolve,reject) => {});
    });
}
