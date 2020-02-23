
import Fs from 'fs'
import Graph from '../Graph'

let graph: Graph;

beforeAll(() => {
    graph = new Graph();
    const dumpContents = Fs.readFileSync(__dirname + '/fft.dump', 'utf8');

    for (const cmd of dumpContents.split('\n'))
        graph.run(cmd);
});

it('correctly joins with a has-skill', () => {
    let joinResults = []
    for (const team of graph.getRelationsSync('team/*')) {

        const teamId = team.getTagValue('team');

        const result = graph.runSync(`get ${teamId} unit/$a | join unit/$a has-skill/Revive`);
        joinResults = joinResults.concat(result);
    }

    expect(joinResults).toEqual([
       "has-skill/Revive [from $a] unit/2d6dd",
       "has-skill/Revive [from $a] unit/56330",
       "has-skill/Revive [from $a] unit/ce769",
    ])
});
