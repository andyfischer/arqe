
import Graph from '../Graph'

describe('createEdge', () => {
    it('returns an existing edge if there is one', () => {
        const graph = new Graph()
        const a = graph.createNode()
        const b = graph.createNode()
        const edge1 = graph.createEdge(a,b)
        const edge2 = graph.createEdge(a,b)
        expect(edge1).toEqual(edge2);
    })
});
