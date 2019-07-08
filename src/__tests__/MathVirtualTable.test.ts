
import { run } from './utils'
import Graph from '../Graph'

it('test-math works', () => {
    const graph = new Graph();
    expect(run(graph, 'get test-math a/2 b/2 sum')).toEqual(['test-math a/2 b/2 sum/4']);
    expect(run(graph, 'get test-math a/4 b/9 sum')).toEqual(['test-math a/4 b/9 sum/13']);
});
