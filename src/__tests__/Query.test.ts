
import Graph from '../Graph'
import Query from '../Query'
import { runQuery } from '../runQuery'
import Pipe from '../Pipe'
import parseTuple from '../stringFormat/parseTuple'
import QueryContext from '../QueryContext'

let graph: Graph;
let cxt: QueryContext;

beforeEach(() => {
    graph = new Graph({
        provide: {
            'a b': 'memory',
            'b c': 'memory'
        }
    });
    cxt = new QueryContext(graph);
});

it('disabled', () => {
});

/*
it("can run a single term", () => {
    const query = new Query();
    const t = query.addTerm('get', parseTuple('a b'))
    query.setOutput(t);

    graph.run("set a b/x");
    graph.run("set a b/y");

    const out = new Pipe();

    runQuery(cxt, query, out);
    expect(out.take().map(t => t.stringify())).toEqual([
        'a b command-meta search-pattern',
        'a b/x',
        'a b/y'
    ])
});

it("can run chained terms", () => {
    const query = new Query();

    const t1 = query.addTerm('get', parseTuple('a b/$b'))
    const t2 = query.addTerm('join', parseTuple('b/$b c'))
    query.connectAsInput(t1, t2);
    query.setOutput(t2);
    
    graph.run("set a/1 b/x");
    graph.run("set a/2 b/y");
    graph.run("set b/x c/x");
    graph.run("set b/y c/y");

    const out = new Pipe();

    runQuery(cxt, query, out);
    expect(out.take().map(t => t.stringify())).toEqual([
        'a b/$b c command-meta search-pattern',
        'a/1 [from $b] b/x c/x',
        'a/2 [from $b] b/y c/y'
    ])
});

*/
