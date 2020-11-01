import Graph from '../../Graph'
import { run, preset } from '../../__tests__/utils'

let graph: Graph = null;

beforeEach(() => {
    graph = new Graph({
        provide: {
            'a b': 'memory',
            'a': 'memory',
            'a c': 'memory',
        }
    });
});

it("works", () => {
    preset(graph, [
        "a b",
        "a b/1",
        "a/2 b/2",
        "a/3",
        "a/4 c/4",
    ]);

    expect(run(graph, "get a b? c? | rename from/b to/bbb")).toEqual([
        "a bbb",
        "a bbb/1",
        "a/2 bbb/2",
        "a/3",
        "a/4 c/4"
    ]);
});
