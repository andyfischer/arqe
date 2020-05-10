"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const receiveToStringStream_1 = __importDefault(require("../receiveToStringStream"));
it("fires callbacks when a related item is saved", () => {
    const graph = new Graph_1.default();
    let calls = [];
    function recentCalls() {
        const result = calls;
        calls = [];
        return result;
    }
    graph.run('listen a/*', receiveToStringStream_1.default(s => calls.push(s)));
    expect(recentCalls()).toEqual([]);
    graph.runSilent('set a/1');
    expect(recentCalls()).toEqual(["a/1"]);
    graph.runSilent('set a/2');
    graph.runSilent('set a/3');
    graph.runSilent('set b/2');
    expect(recentCalls()).toEqual(["a/2", "a/3"]);
    graph.runSilent('delete a/2');
    expect(recentCalls()).toEqual(["delete a/2"]);
    graph.runSilent('delete a/2');
    expect(recentCalls()).toEqual([]);
});
//# sourceMappingURL=GraphListener.test.js.map