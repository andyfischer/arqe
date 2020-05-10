"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const receiveToStringStream_1 = __importDefault(require("../receiveToStringStream"));
it('listen ** notifies on all changes', () => {
    const graph = new Graph_1.default();
    let listenCalls = [];
    graph.run('listen **', receiveToStringStream_1.default(s => listenCalls.push(s)));
    expect(listenCalls).toEqual([]);
    listenCalls = [];
    graph.run('set a');
    expect(listenCalls).toEqual(['a']);
    listenCalls = [];
    graph.run('set a/1 b/1');
    expect(listenCalls).toEqual(['a/1 b/1']);
    listenCalls = [];
    graph.run('set a/1 b/1 val/5');
    expect(listenCalls).toEqual(['a/1 b/1 val/5']);
});
it('listen -get ** first sends messages for existing items', () => {
    const graph = new Graph_1.default();
    graph.run('set a');
    graph.run('set a b');
    graph.run('set a b c val/5');
    let listenCalls = [];
    graph.run('listen -get **', receiveToStringStream_1.default(s => listenCalls.push(s)));
    expect(listenCalls).toEqual([
        'a',
        'a b',
        'a b c val/5',
    ]);
    listenCalls = [];
    graph.run('set a b c val/9');
    expect(listenCalls).toEqual([
        'a b c val/9'
    ]);
});
//# sourceMappingURL=ListenAll.test.js.map