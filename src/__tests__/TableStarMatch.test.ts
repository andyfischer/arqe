
import { setupGraph } from './utils'
import { toTuple } from '../coerce'
import findTablesForPattern from '../findTablesForPattern'

it("works", () => {
    const { graph, run } = setupGraph();

    const mount = graph.provide({
        'star-table args(star)': {
            'find': (input, out) => {
                out.done({'star-table': 'saw: ' + input.stringify()});
            }
        }
    });

    expect(Array.from(findTablesForPattern(graph, toTuple('star-table a=1'))).length).toEqual(1);
    
    expect(run('star-table').stringifyBody()).toEqual(['star-table[saw: star-table]']);
    expect(run('star-table a=1 b=2 c=3').stringifyBody()).toEqual(['star-table[saw: star-table a/1 b/2 c/3] a/1 b/2 c/3']);
});

it("prioritizes star patterns first", () => {
    const { graph, run } = setupGraph();

    const mount = graph.provide({
        'which-table a b': {
            'find': (input, out) => {
                out.done({'which-table': 'non star'});
            }
        }
    });

    expect(run('which-table a b').stringifyBody()).toEqual(['which-table[non star] a b']);

    graph.provide({
        'which-table args(star)': {
            'find': (input, out) => {
                out.done({'which-table': 'star'});
            }
        }
    })

    expect(run('which-table a b').stringifyBody()).toEqual(['which-table/star a b']);
});

