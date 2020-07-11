
import Graph from '../../../Graph'
import watchFile from '../watchFile'

it('triggers events on file change', async () => {
    const graph = new Graph();
    const events = [];
    await watchFile(graph, 'x', (v) => events.push(v));

    graph.run('set log file-changed filename/x');
    expect(events).toEqual(["1"]);
});
