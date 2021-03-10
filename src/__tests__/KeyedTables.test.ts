
import { setupGraph } from './utils'
import { findTablesMatchingRequiredFields } from '../findTablesForPattern'
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

    const keyedTables = Array.from(findTablesMatchingRequiredFields(graph, toTuple('a=1 data')));
    expect(keyedTables.length).toEqual(1)
    expect(keyedTables[0].schema.stringify()).toEqual('a(key) data')

    const aKeyTable = keyedTables[0];

    expect(Array.from(findTablesMatchingRequiredFields(graph, toTuple('a data')))).toEqual([aKeyTable]);

    expect(run('get a=1 data').stringifyBody()).toEqual(['a/1 data/a1']);
    expect(run('get a data').stringifyBody()).toEqual(['a/1 data/a1']);
    expect(run('get b=2 data').stringifyBody()).toEqual(['b/2 data/b2']);
    expect(run('get a b | join a data').stringifyBody()).toEqual(['a/1 b/2 data/a1']);
});
