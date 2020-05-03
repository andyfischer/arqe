
import Graph from '../Graph'

xit('setting object-type creates an object column', () => {
    const graph = new Graph();
    expect(graph.objectTypes.columns.size).toEqual(0);
    graph.run('set object-type/ot');
    expect(graph.objectTypes.columns.size).toEqual(1);
    expect(graph.objectTypes.column('ot')).toBeDefined();
});
