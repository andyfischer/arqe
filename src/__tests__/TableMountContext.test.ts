
import Graph from '../Graph'
import { run } from './utils'

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
});

it("subquery works", () => {
    graph.provide({
        'test1 a b': {
            'find': (input, out) => {
                out.done([{a: 1, b: 'one'}, {a: 2, b: 'two'}, {a: 3, b: 'three'}]);
            }
        },
        'test1-mirror a b': {
            'find a sq(subquery)': (input, out) => {
                const a = input.get('a');
                const subquery = input.get('sq');

                subquery(`get test1 a=${a} b | rename from=test1 to=test1-mirror`, out);
            }
        }
    });

    expect(run(graph, "get test1-mirror a=1 b | just b")).toEqual(['b/one']);
    // expect(run(graph, "get test1-mirror a[2] b | just b")).toEqual(['b/two']);
});
