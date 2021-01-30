
import { setupGraph } from './utils'

it('new style works', () => {
    const { run, graph } = setupGraph();

    graph.provide({
        'table keys(a b) values(c)': {
            'find a': (i,o) => {
                o.done([i.setValue('c', 'a' + i.get('a'))]);
            },
            'find': (i,o) => {
                o.done([{a: 1, b:2, c: 3}]);
            }
        }
    });

    //expect(run('browse')).toEqual('a/1 b/2 c/3');
    //expect(run('get a b c')).toEqual(['a/1 b/2 c/3']);
    //expect(run('browse')).toEqual(['a/1 b/2']);
    expect(run('get a b').stringifyBody()).toEqual(['a/1 b/2']);
});
