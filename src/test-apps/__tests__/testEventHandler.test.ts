
import Graph from '../../Graph'
import TestEventHandlerAPI from '../TestEventHandlerAPI'

let graph: Graph;
let api: TestEventHandlerAPI;
let log = [];

function readLog() {
    const out = log;
    log = [];
    return out;
}

beforeEach(() => {
    graph = new Graph();
    api = new TestEventHandlerAPI(graph);
    log = [];
    api.eventListener(evt => {
        console.log(evt);
        log.push(evt);
    });
});

it('works', () => {
    // api.pushInitialValue('123');

    expect(readLog()).toEqual(['123']);

    api.pushValueChange('456');
});
