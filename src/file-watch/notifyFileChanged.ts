
import getProcessClient from '../toollib/getProcessClient'
import Path from 'path'
import WatchFileApi from './WatchFileApi'

export async function main() {
    let filename = process.argv[2];

    if (!filename) {
        console.log('expected filename argument');
        process.exitCode = -1;
        return;
    }

    filename = Path.resolve(filename);

    let graph;
    
    try {
        graph = await getProcessClient();
    } catch (e) {
        console.error('Failed to connect to server: ' + e);
        process.exitCode = -1;
        return;
    }

    const api = new WatchFileApi(graph);
    await api.postChange(filename);
    graph.close();
}

