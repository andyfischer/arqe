"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../../Graph"));
const TestEventHandlerAPI_1 = __importDefault(require("../TestEventHandlerAPI"));
let graph;
let api;
let log = [];
function readLog() {
    const out = log;
    log = [];
    return out;
}
beforeEach(() => {
    graph = new Graph_1.default();
    api = new TestEventHandlerAPI_1.default(graph);
    log = [];
    api.eventListener(evt => {
        log.push(evt);
    });
});
it('works', () => {
    api.pushInitialValue('123');
    expect(readLog()).toEqual([{ id: 'valueChanged', val: '123' }]);
    api.pushValueChange('456');
    api.pushValueChange('789');
    expect(readLog()).toEqual([{ id: 'valueChanged', val: '456' }, { id: 'valueChanged', val: '789' }]);
    api.pushObject('obj/123');
    expect(readLog()).toEqual([{ id: 'objectChanged', obj: 'obj/123' }]);
    api.deleteObject('obj/123');
    expect(readLog()).toEqual([{ id: 'objectDeleted', obj: 'obj/123' }]);
});
//# sourceMappingURL=testEventHandler.test.js.map