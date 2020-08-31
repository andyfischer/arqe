
import Graph from '../Graph'
import receiveToStringStream from '../receiveToStringStream'
import { run } from './utils'

it('listen ** notifies on all changes', () => {
    const graph = new Graph();
    let listenCalls = [];

    graph.run('listen **', receiveToStringStream(s => listenCalls.push(s)));

    expect(listenCalls).toEqual([]);

    listenCalls = [];
    run(graph, 'set a');
    expect(listenCalls).toEqual(['a']);

    listenCalls = [];
    run(graph, 'set a/1 b/1');
    expect(listenCalls).toEqual(['a/1 b/1']);
    
    listenCalls = [];
    run(graph, 'set a/1 b/1 val/5');
    expect(listenCalls).toEqual(['a/1 b/1 val/5']);
});

xit('listen -get ** first sends messages for existing items', () => {
    const graph = new Graph();
    graph.run('set a');
    graph.run('set a b');
    graph.run('set a b c val/5');

    let listenCalls = [];

    graph.run('listen -get **', receiveToStringStream(s => listenCalls.push(s)));
    //graph.run('get **', receiveToStringStream(s => listenCalls.push(s)));

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
