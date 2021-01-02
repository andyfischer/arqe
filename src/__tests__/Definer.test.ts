
import { setupGraph } from './utils'

it('supports defining a table with just a function', () => {
    const { graph, run } = setupGraph();
    graph.provideWithDefiner(def => def.provide('table1 a', {
        find(i,o) {
            o.done(i.setValue('a', 123));
        }
    }));

    expect(run('get table1 a')).toEqual(['table1 a/123']);
});

it('supports defining a table with just a function', () => {
    const { graph, run } = setupGraph();
    graph.provideWithDefiner(def => def.provide('table1 a', (i,o) => {
        o.done(i.setValue('a', 123));
    }));

    expect(run('get table1 a')).toEqual(['table1 a/123']);
});
