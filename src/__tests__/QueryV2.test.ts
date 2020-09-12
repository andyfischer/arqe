
import Graph from '../Graph'
import QueryV2, { runQueryV2 } from '../QueryV2'
import Pipe from '../Pipe'
import parseTuple from '../parseTuple'

it("can run a single term", () => {
    const query = new QueryV2();
    const t = query.addTerm('get', parseTuple('a b'))
    query.setOutput(t);

    const graph = new Graph();
    graph.run("set a b/x");
    graph.run("set a b/y");

    const out = new Pipe();

    runQueryV2(graph, query, out);
    expect(out.take().map(t => t.stringify())).toEqual([
        'a b command-meta search-pattern',
        'a b/x',
        'a b/y'
    ])
});

it("can run chained terms", () => {
    const query = new QueryV2();

    const t1 = query.addTerm('get', parseTuple('a b/$b'))
    const t2 = query.addTerm('join', parseTuple('b/$b c'))
    query.connectAsInput(t1, t2);
    query.setOutput(t2);
    
    const graph = new Graph();
    graph.run("set a/1 b/x");
    graph.run("set a/2 b/y");
    graph.run("set b/x c/x");
    graph.run("set b/y c/y");

    const out = new Pipe();

    runQueryV2(graph, query, out);
    expect(out.take().map(t => t.stringify())).toEqual([
        'a b/$b command-meta search-pattern c',
        'a/1 [from $b] b/x c/x',
        'a/2 [from $b] b/y c/y'
    ])
});
