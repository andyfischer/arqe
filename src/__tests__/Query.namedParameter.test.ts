
import Graph from '../Graph'

it(`returns correct results when using 'get' with a named parameter`, () => {
    const graph = new Graph({
        provide: {
            'spreadsheet-view input-mode': 'memory'
        }
    });
    graph.runSync('set spreadsheet-view=1 input-mode=normal');

    const result = graph.runSync('get spreadsheet-view=1 input-mode/$m').bodyArr();
    expect(result[0].stringify()).toEqual('spreadsheet-view/1 [from $m] input-mode/normal');
});
