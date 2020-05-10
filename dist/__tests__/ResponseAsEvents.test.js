"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const ResponseAsEvents_1 = __importDefault(require("../ResponseAsEvents"));
let graph;
let events;
let run;
let onMessage;
let onDone;
let allEvents;
beforeEach(() => {
    graph = new Graph_1.default();
    onMessage = jest.fn();
    onDone = jest.fn();
    allEvents = [];
    run = (msg) => {
        events = new ResponseAsEvents_1.default();
        const unpatchedEmit = events.emit;
        events.emit = (name, payload) => {
            allEvents.push([name, payload || null]);
            unpatchedEmit.apply(events, [name, payload]);
        };
        events.on('message', onMessage);
        events.on('done', onDone);
        graph.run(msg, events.receiveCallback());
    };
});
it('correctly triggers events (single get)', () => {
    graph.run('set a/1 == val');
    run('get a/1');
    expect(allEvents).toEqual([
        ['message', 'val'],
        ['done', null]
    ]);
    expect(onMessage).toHaveBeenCalledWith('val');
    expect(onDone).toHaveBeenCalled();
});
//# sourceMappingURL=ResponseAsEvents.test.js.map