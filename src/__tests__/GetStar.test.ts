
import { run } from './utils'
import { Graph } from '..';

let graph;

beforeEach(() => {
    graph = new Graph();
})

it('get * works on no results', () => {
    const result = run(graph, 'get multitest/*');
    expect(result).toEqual([]);
});

it('get * works on single result', () => {
    run(graph, 'set multitest/1');
    const result = run(graph, 'get multitest/*');
    expect(result).toEqual(['multitest/1']);
});

it('get * works on multiple results result', () => {
    run(graph, 'set multitest2/1');
    run(graph, 'set multitest2/2');
    run(graph, 'set multitest2/3');
    expect(run(graph, 'get multitest2/*')).toEqual(['multitest2/1', 'multitest2/2', 'multitest2/3']);
});

it('get * works with additions and deletions', () => {
    run(graph, 'set multitest3/1');
    run(graph, 'set multitest3/2');
    run(graph, 'set multitest3/3');
    expect(run(graph, 'get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3']);

    run(graph, 'set multitest3/4');
    expect(run(graph, 'get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3', 'multitest3/4']);

    run(graph, 'delete multitest3/2');
    expect(run(graph, 'get multitest3/*')).toEqual(['multitest3/1', 'multitest3/3', 'multitest3/4']);
});

it('get works with different tag order', () => {
    run(graph, 'set touchpoint/touchpointInputs2 output var/varStr from(var/*)');
    run(graph, 'set touchpoint/touchpointInputs2 output var/typeStr from(type/*)');

    expect(run(graph, 'get touchpoint/touchpointInputs2 output from/* var/*')).toEqual([
        'touchpoint/touchpointInputs2 output var/varStr from(var/*)',
        'touchpoint/touchpointInputs2 output var/typeStr from(type/*)'
    ]);
})

it('get * works with fixed valueless tags', () => {
    run(graph, 'set a/1 tc23 c')
    expect(run(graph, 'get a/* tc23')).toEqual([]);
    expect(run(graph, 'get a/* tc23 c')).toEqual(['a/1 tc23 c']);
    expect(run(graph, 'get a/* tc23 c d')).toEqual([]);
});

it('get * works with fixed valueless tags 2', () => {
    run(graph, 'set a/1 tc24 c')
    run(graph, 'set a/2 tc24 c')
    expect(run(graph, 'get a/* tc24 c')).toEqual([
        'a/1 tc24 c',
        'a/2 tc24 c'
    ]);
});
