
import { setupGraph } from './utils'

const { graph, run } = setupGraph();

graph.provide({
    "table1 a": {
        'find a': (input, out) => out.done({a: 1})
    }
});

it("get abstract gives valid result for a table that exists", () => {

/*
    expect(run("get table1 a[1]")).toEqual(["table1 a/1"]);

    expect(run("get table1 a(abstract)")).toEqual([
        "table1 a(abstract)"
    ]);
*/
});
