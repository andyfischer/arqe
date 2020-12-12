
import { setupGraph } from './utils';

const { graph, run } = setupGraph();

xit('get -1 fetches one existing item', () => {
    graph.provide({
        'a b': 'memory'
    });

    run('set a[1] b[2]');
    run('set a[2] b[4]');
    run('set a[2] b[6]');

    expect(run('get -1 a[1] b')).toEqual(['a/1 b/2']);
    // expect(run('get -1 a[2] b')).toEqual(['a/2 b/4']);
});
