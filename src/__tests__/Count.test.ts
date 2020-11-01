
import { run } from './utils'
import Graph from '../Graph'

let graph: Graph;

beforeEach(() => {
    graph = new Graph({
        provide: {
            'a': 'memory',
            'b': 'memory',
        }
    });
})

it('empty count', () => {
    expect(run(graph, 'count')).toEqual(['count/0']);
});

it('count search', () => {
    expect(run(graph, 'count a/*')).toEqual(['count/0']);
    run(graph, 'set a/1');
    expect(run(graph, 'count a/*')).toEqual(['count/1']);
    run(graph, 'set a/2');
    run(graph, 'set a/3');
    run(graph, 'set a/4');
    expect(run(graph, 'count a/*')).toEqual(['count/4']);
});

it('count piped', () => {
    expect(run(graph, 'get a/* | count')).toEqual(['count/0']);
    run(graph, 'set a/1');
    expect(run(graph, 'get a/* | count')).toEqual(['count/1']);
    run(graph, 'set a/2');
    run(graph, 'set a/3');
    run(graph, 'set a/4');
    expect(run(graph, 'get a/* | count')).toEqual(['count/4']);
});

it('count search and piped', () => {
    expect(run(graph, 'get a/* | count b/*')).toEqual(['count/0']);
    run(graph, 'set a/1');
    expect(run(graph, 'get a/* | count b/*')).toEqual(['count/1']);
    run(graph, 'set b/1');
    expect(run(graph, 'get a/* | count b/*')).toEqual(['count/2']);
    run(graph, 'set a/2');
    run(graph, 'set a/3');
    run(graph, 'set a/4');
    expect(run(graph, 'get a/* | count b/*')).toEqual(['count/5']);
    run(graph, 'set b/2');
    run(graph, 'set b/3');
    run(graph, 'set b/4');
    expect(run(graph, 'get a/* | count b/*')).toEqual(['count/8']);
});
