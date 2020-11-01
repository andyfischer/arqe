
import setupNestedQueryTable from '../tables/NestedQueryTest'
import Graph from '../Graph'
import { run } from './utils';

it("handles indirect queries", () =>{
    const graph = new Graph({
        provide: {
            'a b': 'memory'
        }
    });
    graph.provide(setupNestedQueryTable());

    run(graph, "set a b/1");
    expect(run(graph, "get nested-query-test pattern(a b) | just a b")).toEqual(["a b/1"])

    run(graph, "set nested-query-test pattern(a/2 b/2)");
    expect(run(graph, "get a/2 b")).toEqual(["a/2 b/2"])
})
