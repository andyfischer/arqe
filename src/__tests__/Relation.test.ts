import { Graph } from ".."
import Pipe from "../Pipe";
import parseTuple from "../stringFormat/parseTuple";
import { setupGraph } from './utils'

it("includes a correct header", () => {
    const { graph, run } = setupGraph({
        provide: {
            'a b': 'memory'
        }
    });

    run("set a b/1");
    run("set a b/2");

    const out = graph.run("get a b");
    const relation = out.takeAsRelation();

    expect(relation.header().stringify()).toEqual("a b");
    expect(Array.from(relation.body()).map(t => t.stringify())).toEqual([
        "a b/1",
        "a b/2"
    ])
})
