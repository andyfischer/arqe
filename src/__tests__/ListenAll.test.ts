
import Graph from '../Graph'
import receiveToStringStream from '../receiveToStringStream'

it('listen ** notifies on all changes', () => {
    const graph = new Graph();
    let listenCalls = [];

    graph.run('listen **', receiveToStringStream(s => listenCalls.push(s)));

    expect(listenCalls).toEqual([]);

    listenCalls = [];
    graph.runSilent('set a');
    expect(listenCalls).toEqual(['a']);

    listenCalls = [];
    graph.runSilent('set a/1 b/1');
    expect(listenCalls).toEqual(['a/1 b/1']);
    
    listenCalls = [];
    graph.runSilent('set a/1 b/1 val/5');
    expect(listenCalls).toEqual(['a/1 b/1 val/5']);
});

it('listen -get ** first sends messages for existing items', () => {
    const graph = new Graph();
    graph.runSilent('set a');
    graph.runSilent('set a b');
    graph.runSilent('set a b c val/5');

    let listenCalls = [];

    graph.run('listen -get **', receiveToStringStream(s => listenCalls.push(s)));

    expect(listenCalls).toEqual([
        'a',
        'a b',
        'a b c val/5',
    ]);

    listenCalls = [];
    graph.runSilent('set a b c val/9');
    expect(listenCalls).toEqual([
        'a b c val/9'
    ]);
});
