"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
it("fires callbacks when a related item is saved", () => {
    const graph = new Graph_1.default();
    let calls = [];
    function recentCalls() {
        const result = calls;
        calls = [];
        return result;
    }
    graph.run('listen a/*', (msg) => calls.push(msg));
    expect(recentCalls()).toEqual(['#start']);
    graph.run('set a/1');
    expect(recentCalls()).toEqual(["set a/1"]);
    graph.run('set a/2');
    graph.run('set a/3');
    graph.run('set b/2');
    expect(recentCalls()).toEqual(["set a/2", "set a/3"]);
    graph.run('delete a/2');
    expect(recentCalls()).toEqual(["delete a/2"]);
    graph.run('delete a/2');
    expect(recentCalls()).toEqual([]);
});
//# sourceMappingURL=GraphListener.test.js.map