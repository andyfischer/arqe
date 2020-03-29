
import Graph from '../Graph'
import receiveToStringStream from '../receiveToStringStream'

it("fires callbacks when a related item is saved", () => {
    const graph = new Graph();

    let calls = [];
    function recentCalls() {
        const result = calls;
        calls = [];
        return result;
    }

    graph.run2('listen a/*', receiveToStringStream(s => calls.push(s)));

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
})
