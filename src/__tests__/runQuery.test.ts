
import { runQuery } from '../query/runQuery'
import { parseQuery } from '../parser/parseQuery'
import parseTuple from '../parser/parseTuple'
import Pipe from '../Pipe'
import QueryContext from '../QueryContext'
import { setupGraph } from './utils'

it("works with an incoming pipe", () => {
    
    const { graph } = setupGraph();

    const q = parseQuery("rewrite b(from-val c) | annotate d=4");

    const input = new Pipe('input');

    const out = runQuery(new QueryContext(graph), q, input);

    input.next(parseTuple("a=1 c=5"));

    expect(out.buffer()[0].stringify()).toEqual("b/5 d/4")

    out.deleteBuffer();
});

function setup() {
    const { run, graph } = setupGraph({
        provide: {
            'a value': 'memory',
            'query1 query': 'memory',
            'a is_even value': 'memory',
            'named-query query': 'memory',
        }
    });

    return { run, graph }
}

it("works with search field", () => {
    const { run } = setup();
    run("set a/1 value/123");
    run("set a/2 value/abc");

    run("set query1 query(get a value)");

    expect(run("run-query query1 query").stringifyBody()).toEqual([
        'a/1 value/123',
        'a/2 value/abc',
    ]);
});

it("works with piped input", () => {
    const { run } = setup();
    run("set a/1 value/123");
    run("set a/2 value/abc");

    expect(run("val query(get a/1 value) | run-query").stringifyBody()).toEqual([
        'a/1 value/123',
    ]);
});

it("works with multiple inputs", () => {
    /*
    const { graph, run } = setup();
    preset(graph, [
        "a/1 value/one",
        "a/2 value/two",
        "a/3 value/three",
        "a/4 value/four",
        "a/2 is_even value/two",
        "a/4 is_even value/four",
        "named-query/even-numbers query(get a value is_even)"
    ])

    expect(run("val query(get a/1 value) | run-query query named-query/even-numbers").stringifyBody()).toEqual([
        'a/1 value/one',
        'a/2 is_even value/two',
        'a/4 is_even value/four',
    ]);

   */
});
