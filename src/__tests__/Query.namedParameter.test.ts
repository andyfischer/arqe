
import Graph from '../Graph'

it(`returns correct results when using 'get' with a named parameter`, () => {
    const graph = new Graph();
    graph.runSync('set spreadsheet-view/1 input-mode/normal');

    const result = graph.runCommandChainSync('get spreadsheet-view/1 input-mode/$m')
        .filter(rel => !rel.hasAttr('command-meta'));

    expect(result[0].stringify()).toEqual('spreadsheet-view/1 [from $m] input-mode/normal');
});
