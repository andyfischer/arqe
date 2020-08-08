
import { run } from './utils'
import { Graph } from '..';

test('empty get works', () => {
    const graph = new Graph();
    expect(run(graph, 'get')).toEqual([]);
});
