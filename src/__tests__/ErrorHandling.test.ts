
import Graph from '../Graph'
import { setupGraph } from './utils'

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
})

it("throwing an exception in a handler registers as an error", () => {
    const { run, graph, toRelation } = setupGraph();

    graph.provide({
        'throws': {
            find(i,o) {
                throw new Error("an error")
            }
        }
    });

    const result = toRelation('get throws');
    const error = result.firstError();
    expect(error.get('message')).toEqual('an error');
    expect(error.has('stack')).toBe(true);
});
