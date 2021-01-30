
import { setupGraph } from './utils'

it('works correctly', () => {
    const { graph, run } = setupGraph();
    graph.provide({
        a: {
            find: (i,o) => {
                o.done([{a:1}]);
            }
        },
        b: {
            'find sq(subquery)': (i,o) => {
                const { sq } = i.obj();

                sq('get a | rename a b')
                .then(rel => {
                    o.done(rel);
                })
            }
        }
    });

    expect(run('get b').stringifyBody()).toEqual(['b/1']);
});
