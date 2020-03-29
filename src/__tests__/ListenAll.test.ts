
import Graph from '../Graph'
import receiveToStringStream from '../receiveToStringStream'

it('listen ** notifies on all changes', () => {
    const graph = new Graph();
    let listenCalls = [];

    graph.run2('listen **', receiveToStringStream(s => listenCalls.push(s)));

    expect(listenCalls).toEqual([]);

    listenCalls = [];
    graph.run('set a');
    expect(listenCalls).toEqual(['a']);

    listenCalls = [];
    graph.run('set a/1 b/1');
    expect(listenCalls).toEqual(['a/1 b/1']);
    
    listenCalls = [];
    graph.run('set a/1 b/1 == 5');
    expect(listenCalls).toEqual(['a/1 b/1 == 5']);
});

it('listen -get ** first sends messages for existing items', () => {
    const graph = new Graph();
    graph.run('set a');
    graph.run('set a b');
    graph.run('set a b c == 5');

    let listenCalls = [];

    graph.run2('listen -get **', receiveToStringStream(s => listenCalls.push(s)));

    expect(listenCalls).toEqual([
        'a',
        'a b',
        'a b c == 5',
    ]);

    listenCalls = [];
    graph.run('set a b c == 9');
    expect(listenCalls).toEqual([
        'a b c == 9'
    ]);
});
