import Graph from "../Graph"
import parseTuple from "../stringFormat/parseTuple";
import Pipe from "../Pipe";
import { setupGraph } from "./utils";

it('get accepts a Tuple as input', () => {
    const { run, graph } = setupGraph({
        provide: {
            'a b': 'memory'
        }
    });

    run('set a/1 b/1')

    expect(run('get a/$a b').stringifyBuffer()).toEqual([
        'a/$a b command-meta search-pattern',
        '[from $a] a/1 b/1'
    ]);
})

describe('removeTables', () => {
    it('works', () => {
        const { run, graph } = setupGraph({
            provide: {
                'a b': 'memory'
            }
        });

        const mounts = graph.provide({
            'a': 'memory'
        });

        expect(run('get a').stringifyBody()).toEqual([]);
        expect(run('set a/1').stringifyBody()).toEqual(["a/1"]);

        graph.removeTables(mounts);

        expect(() => {
            run('get a').rel().rethrow();
        }).toThrow("No table found for pattern");
    });
});
