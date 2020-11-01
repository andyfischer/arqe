import Graph from "../Graph"
import { run } from './utils'
import parseTuple from "../stringFormat/parseTuple";
import Pipe from "../utils/Pipe";

it('get accepts a Tuple as input', () => {
    const graph = new Graph({
        provide: {
            'a b': 'memory'
        }
    });

    graph.run('set a/1 b/1')

    const out = new Pipe();
    graph.get(parseTuple('a/$a b'), out);
    expect(out.take().map(t => t.stringify())).toEqual([
        'a/$a b command-meta search-pattern',
        '[from $a] a/1 b/1'
    ]);
})

describe('removeTables', () => {
    it('works', () => {
        const graph = new Graph();

        const mounts = graph.provide({
            'a': 'memory'
        });

        expect(run(graph, 'get a')).toEqual([]);
        expect(run(graph, 'set a/1')).toEqual(["a/1"]);

        graph.removeTables(mounts);

        expect(() => {
            run(graph, 'get a');
        }).toThrow("No table found for: a");
    });
});
