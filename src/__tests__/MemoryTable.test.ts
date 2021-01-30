
import { setupGraph } from './utils'

it('supports direct access', () => {
    const { graph, run } = setupGraph();

    run('set memory key(a=1) value(c=101)');
    run('set memory key(a=2) value(c=202)');
    expect(run('get memory key(a=1) value').stringifyBody()).toEqual(['memory key(a/1) value(c/101)']);
    expect(run('get memory key(a=2) value').stringifyBody()).toEqual(['memory key(a/2) value(c/202)']);
    expect(run('get memory key value').stringifyBody()).toEqual([
        'memory key(a/1) value(c/101)',
        'memory key(a/2) value(c/202)'
    ]);
});

it('can be used as the backing for a custom table', () => {
    const { graph, run } = setupGraph();

    graph.provide({
        //'table1 val': 'get memory key(from table1) value(from table1 val)'
        //'table1 val': 'rewrite memory key(from table1) value(from table1 val)',
        //'table1 val': 'rewrite $i memory key(from $i table1) value(from $i table1 val)',
    });

    //run('set table1=1 val=2')

    //console.log('run get memory key value');

});
