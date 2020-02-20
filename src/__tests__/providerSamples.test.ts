
import Graph from '../Graph'
import UpdateContext, { runUpdateOnce } from '../UpdateContext'

it('test with getRelations', () => {
    const graph = new Graph();
    graph.run('set a b/123')
    graph.run('set a b/456')

    const result = runUpdateOnce(graph, cxt => {
        const out = []
        for (const rel of cxt.getRelations("a b/*")) {
            out.push(rel.getTagValue("b"));
        }
        return out;
    });

    expect(result).toEqual(['123', '456']);
});

it('test with getOptionsObject', () => {
    const graph = new Graph();
    graph.run('set a b/123')
    graph.run('set a b/123 .foo == bee')
    graph.run('set a b/456')
    graph.run('set a b/456 .opt1 == bar')
    graph.run('set a b/456 .opt2 == zee')

    const result = runUpdateOnce(graph, cxt => {
        const out = {}
        for (const rel of cxt.getRelations("a b/*")) {
            out[rel.getTagValue("b") as string] = cxt.getOptionsObject(rel.stringify());
        }
        return out;
    });

    expect(result).toEqual({
        123: {
            foo: 'bee'
        },
        456: {
            opt1: 'bar',
            opt2: 'zee'
        }
    });
});
