
import { setupGraph } from "./utils";

it("works as expected", () => {
    const { run, graph } = setupGraph();

    graph.provide({a: 'memory'});

    run('set a=1');
    run('set a=2');
    run('set a=3');

    expect(run('get a').stringifyBody()).toEqual(['a/1','a/2','a/3']);
    expect(run('get a | one').stringifyBody()).toEqual(['a/1']);
});
