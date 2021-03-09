
import Graph from '../Graph'
import Pipe from '../Pipe';
import parseTuple from '../parser/parseTuple';
import { setupGraph } from "./utils";

it('getting a pattern with identifiers returns tuples with identifiers', () => {
    const { run, graph } = setupGraph({
        provide: {
            x: 'memory'
        }
    });
    run('set x/1')
    run('set x/2')

    expect(run('get x/$a').stringifyBuffer()).toEqual([
        'x/$a command-meta search-pattern',
        '[from $a] x/1',
        '[from $a] x/2'
    ]);
});

