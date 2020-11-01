
import { run } from './utils'
import { Graph } from '..';

let graph;

beforeEach(() => {
    graph = new Graph({
        provide: {
            multitest: 'memory',
            'a b': 'memory',
            'a b c': 'memory',
            'a b c d': 'memory',
            'touchpoint output var from': 'memory',
        }
    });
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
    run(graph, 'set multitest/1');
    run(graph, 'set multitest/2');
    run(graph, 'set multitest/3');
    expect(run(graph, 'get multitest/*')).toEqual(['multitest/1', 'multitest/2', 'multitest/3']);
});

it('get * works with additions and deletions', () => {
    run(graph, 'set multitest/1');
    run(graph, 'set multitest/2');
    run(graph, 'set multitest/3');
    expect(run(graph, 'get multitest/*')).toEqual(['multitest/1', 'multitest/2', 'multitest/3']);

    run(graph, 'set multitest/4');
    expect(run(graph, 'get multitest/*')).toEqual(['multitest/1', 'multitest/2', 'multitest/3', 'multitest/4']);

    run(graph, 'delete multitest/2');
    expect(run(graph, 'get multitest/*')).toEqual(['multitest/1', 'multitest/3', 'multitest/4']);
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
    run(graph, 'set a/1 b c')
    expect(run(graph, 'get a/* b')).toEqual([]);
    expect(run(graph, 'get a/* b c')).toEqual(['a/1 b c']);
    expect(run(graph, 'get a/* b c d')).toEqual([]);
});

it('get * works with fixed valueless tags 2', () => {
    run(graph, 'set a/1 b c')
    run(graph, 'set a/2 b c')
    expect(run(graph, 'get a/* b c')).toEqual([
        'a/1 b c',
        'a/2 b c'
    ]);
});
