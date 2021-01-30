
import Graph from '../Graph'
import { setupGraph, preset } from './utils'

it("works", () => {
    const { graph, run } = setupGraph({
        provide: {
            'a b': 'memory',
            'a': 'memory',
            'a c': 'memory',
        }
    });

    preset(graph, [
        "a b",
        "a b/1",
        "a/2 b/2",
        "a/3",
        "a/4 c/4",
    ]);

    expect(run("get a b? c? | rename b bbb").stringifyBody()).toEqual([
        "a bbb",
        "a bbb/1",
        "a/2 bbb/2",
        "a/3",
        "a/4 c/4"
    ]);
});
