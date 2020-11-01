import { Graph } from ".."
import { run } from './utils'
import { receiveToRelation } from "../receiveUtils";
import Pipe from "../utils/Pipe";
import parseTuple from "../stringFormat/parseTuple";

it("includes a correct header", () => {
    const graph = new Graph({
        provide: {
            'a b': 'memory'
        }
    });
    run(graph, "set a b/1");
    run(graph, "set a b/2");

    const out = new Pipe();
    graph.get("a b", out);
    const relation = out.takeAsRelation();

    expect(relation.header().stringify()).toEqual("a b");
    expect(Array.from(relation.body()).map(t => t.stringify())).toEqual([
        "a b/1",
        "a b/2"
    ])
})
