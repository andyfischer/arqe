
import Graph from '../Graph'
import UpdateContext, { runUpdateOnce } from '../UpdateContext'

it('test with getTuples', () => {
    const graph = new Graph();
    graph.run('set a b/123')
    graph.run('set a b/456')

    const result = runUpdateOnce(graph, cxt => {
        const out = []
        for (const rel of cxt.getTuples("a b/*")) {
            out.push(rel.getTagValue("b"));
        }
        return out;
    });

    expect(result).toEqual(['123', '456']);
});
