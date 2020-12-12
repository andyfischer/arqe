
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

                sq('get a | rename from=a to=b')
                .then(rel => {
                    console.log('test: ', rel.stringify())
                    o.done(rel);
                })
            }
        }
    });

    expect(run('get b')).toEqual(['b/1']);
});
