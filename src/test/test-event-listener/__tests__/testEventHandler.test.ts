
import Graph from '../../../Graph'
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
        log.push(evt);
    });
});

it('works', () => {
    api.pushInitialValue('123');
    expect(readLog()).toEqual([{id: 'valueChanged', val: '123'}]);

    api.pushValueChange('456');
    api.pushValueChange('789');
    expect(readLog()).toEqual([{id: 'valueChanged', val: '456'},{id: 'valueChanged', val: '789'}]);

    api.pushObject('obj/123')
    expect(readLog()).toEqual([{id: 'objectChanged', obj: 'obj/123'}]);

    api.deleteObject('obj/123')
    expect(readLog()).toEqual([{id: 'objectDeleted', obj: 'obj/123'}]);
});
