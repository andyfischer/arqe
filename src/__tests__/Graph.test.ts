import Graph from "../Graph"
import { run } from './utils'
import parseTuple from "../parseTuple";
import Pipe from "../Pipe";

it('get accepts a Tuple as input', () => {
    const graph = new Graph();

    graph.run('set a/1 b/1')

    const out = new Pipe();
    graph.get(parseTuple('a/$a b'), out);
    expect(out.take().map(t => t.stringify())).toEqual([
        'a/$a b command-meta search-pattern',
        '[from $a] a/1 b/1'
    ]);
})