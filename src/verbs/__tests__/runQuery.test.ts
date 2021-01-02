
import Graph from '../../Graph'
import { run, preset } from '../../__tests__/utils'

let graph: Graph = null;

beforeEach(() => {
    graph = new Graph({
        provide: {
            'a value': 'memory',
            'query1 query': 'memory',
            'a is_even value': 'memory',
            'named-query query': 'memory',
        }
    });
});

it("works with search field", () => {
    run(graph, "set a/1 value/123");
    run(graph, "set a/2 value/abc");

    run(graph, "set query1 query(get a value)");

    expect(run(graph, "run-query query1 query")).toEqual([
        'a/1 value/123',
        'a/2 value/abc',
    ]);
});

it("works with piped input", () => {
    run(graph, "set a/1 value/123");
    run(graph, "set a/2 value/abc");

    expect(run(graph, "val query(get a/1 value) | run-query")).toEqual([
        'a/1 value/123',
    ]);
});

it("works with multiple inputs", () => {
    preset(graph, [
        "a/1 value/one",
        "a/2 value/two",
        "a/3 value/three",
        "a/4 value/four",
        "a/2 is_even value/two",
        "a/4 is_even value/four",
        "named-query/even-numbers query(get a value is_even)"
    ])

    expect(run(graph, "val query(get a/1 value) | run-query query named-query/even-numbers")).toEqual([
        'a/1 value/one',
        'a/2 is_even value/two',
        'a/4 is_even value/four',
    ]);


});
