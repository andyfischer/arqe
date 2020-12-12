
import Graph from '../Graph'
import { setupGraph } from './utils'

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
})

it('getRelationAsync throws error for no table found', async () => {
    expect.assertions(1);

    try {
        await graph.getRelationAsync('a b c')
    } catch (err) {
        expect(err.message).toEqual('No table found for pattern')
    }
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
