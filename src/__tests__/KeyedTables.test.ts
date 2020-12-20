
import { setupGraph } from './utils'
import { findTablesWithKeyedAccess } from '../findTablesForPattern'
import { toTuple } from '../coerce'

it("picks the provider with available keys", () => {

    const { graph, run } = setupGraph();
    graph.provide({
        'a(key) data': {
            find(i,o) {
                o.done([{a: 1, data: 'a1'}]);
            }
        },
        'b(key) data': {
            find(i,o) {
                o.done([{b: 2, data: 'b2'}, {b: 3, data: 'b3'}]);
            }
        },
        'a(key) b(key)': {
            find(i,o) {
                o.done([{a:1, b: 2}]);
            }
        }
    });

    const keyedTables = findTablesWithKeyedAccess(graph, toTuple('a=1 data'))
    expect(keyedTables.length).toEqual(1)
    expect(keyedTables[0].schema.stringify()).toEqual('a(key) data')

    const aKeyTable = keyedTables[0];

    expect(findTablesWithKeyedAccess(graph, toTuple('a data'))).toEqual([aKeyTable]);

    expect(run('get a=1 data')).toEqual(['a/1 data/a1']);
    expect(run('get a data')).toEqual(['a/1 data/a1']);
    expect(run('get b=2 data')).toEqual(['b/2 data/b2']);
    expect(run('get a b | join a data')).toEqual(['a/1 b/2 data/a1']);
});
