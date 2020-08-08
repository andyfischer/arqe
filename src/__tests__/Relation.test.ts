import { Graph } from ".."
import { run } from './utils'
import { receiveToRelation } from "../receiveUtils";
import Pipe from "../Pipe";
import parseTuple from "../parseTuple";

it("includes a correct header", () => {
    const graph = new Graph();
    run(graph, "set a b/1");
    run(graph, "set a b/2");

    const out = new Pipe();
    graph.get("a b", out);
    const relation = out.takeAsRelation();

    expect(relation.getOrInferHeader().stringify()).toEqual("a b");
    expect(relation.tuples.map(t => t.stringify())).toEqual([
        "a b/1",
        "a b/2"
    ])
})