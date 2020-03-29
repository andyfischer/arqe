
import Graph from '../Graph'
import receiveToStringStream from '../receiveToStringStream'

it('listen ** notifies on all changes', () => {
    const graph = new Graph();
    let listenCalls = [];

    graph.run2('listen **', receiveToStringStream(s => listenCalls.push(s)));

    expect(listenCalls).toEqual([]);

    listenCalls = [];
    graph.runSilent('set a');
    expect(listenCalls).toEqual(['a']);

    listenCalls = [];
    graph.runSilent('set a/1 b/1');
    expect(listenCalls).toEqual(['a/1 b/1']);
    
    listenCalls = [];
    graph.runSilent('set a/1 b/1 == 5');
    expect(listenCalls).toEqual(['a/1 b/1 == 5']);
});

it('listen -get ** first sends messages for existing items', () => {
    const graph = new Graph();
    graph.runSilent('set a');
    graph.runSilent('set a b');
    graph.runSilent('set a b c == 5');

    let listenCalls = [];

    graph.run2('listen -get **', receiveToStringStream(s => listenCalls.push(s)));

    expect(listenCalls).toEqual([
        'a',
        'a b',
        'a b c == 5',
    ]);

    listenCalls = [];
    graph.runSilent('set a b c == 9');
    expect(listenCalls).toEqual([
        'a b c == 9'
    ]);
});
