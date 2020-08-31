
import Graph from '../Graph'

let graph: Graph;

beforeEach(() => {
    graph = new Graph({ autoinitMemoryTables: false });
})

it('getRelationAsync throws error for no table found', async () => {
    expect.assertions(1);

    try {
        await graph.getRelationAsync('a b c')
    } catch (err) {
        expect(err.message).toEqual('No table found for: a b c')
    }
})