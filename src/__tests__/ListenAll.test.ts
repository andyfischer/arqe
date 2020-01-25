
import Graph from '../Graph'

it('listen ** notifies on all changes', () => {
    const graph = new Graph();
    let listenCalls = [];

    graph.run('listen **', msg => {
        listenCalls.push(msg);
    });

    expect(listenCalls).toEqual(['#start']);

    listenCalls = [];
    graph.run('set a');
    expect(listenCalls).toEqual(['set a']);

    listenCalls = [];
    graph.run('set a/1 b/1');
    expect(listenCalls).toEqual(['set a/1 b/1']);
    
    listenCalls = [];
    graph.run('set a/1 b/1 == 5');
    expect(listenCalls).toEqual(['set a/1 b/1 == 5']);
});

it('listen -get ** first sends messages for existing items', () => {
    const graph = new Graph();
    graph.run('set a');
    graph.run('set a b');
    graph.run('set a b c == 5');

    let listenCalls = [];

    graph.run('listen -get **', msg => {
        listenCalls.push(msg);
    });

    expect(listenCalls).toEqual([
        '#start',
        'set a',
        'set a b',
        'set a b c == 5'
    ]);

    listenCalls = [];
    graph.run('set a b c == 9');
    expect(listenCalls).toEqual([
        'set a b c == 9'
    ]);
});