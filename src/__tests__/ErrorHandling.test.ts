
import Graph from '../Graph'
import { setupGraph } from './utils'

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
})

it("throwing an exception in a handler registers as an error", () => {
    const { run, graph } = setupGraph();

    graph.provide({
        'throws': {
            find(i,o) {
                throw new Error("an error")
            }
        }
    });

    const result = run('get throws').rel();
    const error = result.firstError();
    expect(error.get('message')).toEqual('an error');
    expect(error.has('stack')).toBe(true);
});
