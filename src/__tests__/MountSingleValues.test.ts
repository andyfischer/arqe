import { Graph } from "..";
import parseTuple from "../parseTuple";
import { run } from "./utils";

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
})

it('mountSingleValueTable works', () => {
    const val = graph.mountSingleValueTable("b", parseTuple("a"), "b");

    expect(run(graph, "get a b")).toEqual(["a b"])

    val.set(5);
    expect(run(graph, "get a b")).toEqual(["a b/5"])
})

it('can search multiple tables with the same pattern', () => {
    const a1 = graph.mountSingleValueTable("b", parseTuple("a/1"), "b");
    const a2 = graph.mountSingleValueTable("b", parseTuple("a/2"), "b");

    a1.set(11);
    a2.set(22);

    expect(run(graph, "get a b")).toEqual(["a/1 b/11","a/2 b/22"]);
});