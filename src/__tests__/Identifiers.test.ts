
import Graph from '../Graph'
import { run } from './utils'
import Pipe from '../utils/Pipe';
import { parsePattern } from '../parseCommand';

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

xit('sendRelationValue includes the header', () => {

    const graph = new Graph({
        provide: {
            'x y z': 'memory'
        }
    });
    const out = new Pipe();

    graph.sendRelationValue(parsePattern("x/$a y/$b z/1"), out, "rel");

    const tuples = out.take();
    expect(tuples.length).toEqual(1);
    const relValue = tuples[0];
    expect(relValue.stringify()).toEqual('rel([x/$a y/$b z/1 command-meta search-pattern])');
});
