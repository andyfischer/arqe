
import Graph from '../Graph'
import { run } from './utils'
import Pipe from '../Pipe';
import parseTuple from '../stringFormat/parseTuple';

it('getting a pattern with identifiers returns tuples with identifiers', () => {
    const graph = new Graph({
        provide: {
            x: 'memory'
        }
    });
    run(graph, 'set x/1')
    run(graph, 'set x/2')

    expect(run(graph, 'get x/$a', { withHeaders: true })).toEqual([
        'x/$a command-meta search-pattern',
        '[from $a] x/1',
        '[from $a] x/2'
    ]);
});

