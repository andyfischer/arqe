
import Graph from '../Graph'

it("fires callbacks when a related item is saved", () => {
    const graph = new Graph();

    let calls = [];
    function recentCalls() {
        const result = calls;
        calls = [];
        return result;
    }

    graph.addStringListener('listen a/*', (msg) => calls.push(msg));

    expect(recentCalls()).toEqual([]);

    graph.handleCommandStr('set a/1');
    expect(recentCalls()).toEqual(["set a/1"]);

    graph.handleCommandStr('set a/2');
    graph.handleCommandStr('set a/3');
    graph.handleCommandStr('set b/2');
    expect(recentCalls()).toEqual(["set a/2", "set a/3"]);

    graph.handleCommandStr('delete a/2');
    expect(recentCalls()).toEqual(["delete a/2"]);

    graph.handleCommandStr('delete a/2');
    expect(recentCalls()).toEqual([]);
})
