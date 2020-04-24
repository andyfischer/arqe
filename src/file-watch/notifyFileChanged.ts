
import Path from 'path'
import WatchFileApi from './WatchFileApi'
import runStandardProcess from '../toollib/runStandardProcess'
import Graph from '../Graph'

export function main() {
    runStandardProcess(async (graph: Graph) => {
        let filename = process.argv[2];

        if (!filename) {
            console.log('Expected filename argument');
            process.exitCode = -1;
            return;
        }

        filename = Path.resolve(filename);

        const api = new WatchFileApi(graph);
        await api.postChange(filename);
    });
}

