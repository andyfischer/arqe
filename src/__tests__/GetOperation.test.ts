
import Graph from '../Graph'

it('supports ** to match everything', () => {
    const graph = new Graph();

    graph.run('set a');
    graph.run('set a b == 4');

    expect(graph.runSync('get **')).toEqual([
        'a',
        'a b == 4'
    ]);
});
