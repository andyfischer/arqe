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
    const unpatchedOn = graph.on;
    graph.on = (name, payload) => {
        allEvents.push([name, payload]);
        unpatchedOn(name, payload);
    };
    graph.on('message', onMessage);
    graph.on('done', onDone);
    run = (msg) => {
        events = new ResponseAsEvents_1.default();
        graph.run(msg, events.receiveCallback());
    };
});
it('correctly triggers events (single get)', () => {
    graph.run('set a/1 -- val', () => 0);
    run('get a/1');
    expect(onMessage).toHaveBeenCalledWith('val');
    expect(onDone).toHaveBeenCalled();
    expect(allEvents).toEqual([
        ['message', 'val'],
        ['dne', null]
    ]);
});
//# sourceMappingURL=ResponseAsEvents.js.map