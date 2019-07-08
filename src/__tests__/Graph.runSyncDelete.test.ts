
import Graph from '../Graph'

it('works when using "delete" in runSync', () => {
    const graph = new Graph();
    graph.runSync('set a b/1')
    graph.runSync('delete a b/*');
});
