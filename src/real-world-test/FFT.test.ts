
import Fs from 'fs'
import Path from 'path'
import Graph from '../Graph'

let graph: Graph;

beforeAll(async () => {
    graph = new Graph();
    //await graph.loadDumpFile(Path.join(__dirname, 'fft.dump'));
});

it('correctly joins with a has-skill', () => {
    /*
    let joinResults = []
    for (const team of graph.getRelationsSync('team/*')) {

        const teamId = team.getTagValue('team');

        const result = graph.runSyncOld(`get ${teamId} unit/$a | join unit/$a has-skill/Revive`);
        joinResults = joinResults.concat(result);
    }

    expect(joinResults).toEqual([
       "[from $a] unit/2d6dd",
       "[from $a] unit/56330",
       "[from $a] unit/ce769",
    ])
    */
});
