
import Graph from "../Graph";
import { setupGraph } from './utils'

it('join works', () => {
    const { graph, run } = setupGraph();

    graph.provide({
        'a b': 'memory',
        'b c': 'memory',
        'c d': 'memory'
    });

    run('set a b=1')
    run('set a b=2')
    run('set a b=3')
    run('set b=1 c')
    run('set b=4 c')
    expect(run('get a b/$b | join b/$b c', { withHeaders: true })).toEqual([
        'a b/$b c command-meta search-pattern',
        'a [from $b] b/1 c'
    ]);
});

it('double join works', () => {
    const { graph, run } = setupGraph();

    graph.provide({
        'a b': 'memory',
        'b c': 'memory',
        'c d': 'memory'
    });

    run('set a b/1')
    run('set a b/2')
    run('set a b/3')
    run('set b/1 c/1')
    run('set b/4 c/1');
    run('set c/1 d/1')
    run('set c/1 d/2')
    expect(run('get a b/$b | join b/$b c/$c | join c/$c d', { withHeaders: true })).toEqual(
    [
        'a b/$b c/$c d command-meta search-pattern',
        'a [from $b] b/1 [from $c] c/1 d/1',
        'a [from $b] b/1 [from $c] c/1 d/2'
    ]);
});

it(`knows how to join on a pattern that doesn't support total search`, () => {
    const { graph, run } = setupGraph();
    
    graph.provide({
        a: {
            find: (i,o) => {
                o.done([
                    {a: 1},
                    {a: 2},
                    {a: 3}
                ])
            }
        },
        'n squared': {
            'find n': (i,o) => {
                const val = parseInt(i.get('n'))
                o.done([{squared: val*val}]);
            }
        }
    });

    expect(run('get a/$a | join n/$a squared')).toEqual([
        '[from $a] a/1 [from $a] n/1 squared/1',
        '[from $a] a/2 [from $a] n/2 squared/4',
        '[from $a] a/3 [from $a] n/3 squared/9'
    ]);
});

it(`supports join by attr`, () => {
    const { graph, run } = setupGraph();

    graph.provide({
        'a asqr': {
            find: (i,o) => {
                o.done([{a:2,asqr:4},{a:3,asqr:9}]);
            }
        },
        'asqr asqrsqr': {
            'find asqr': (i,o) => {
                const asqr = i.getInt('asqr');
                o.done([{asqr, asqrsqr: asqr * asqr}]);
            }
        }
    });

    expect(run('get a asqr | join asqr asqrsqr')).toEqual([
        'a/2 asqr/4 asqrsqr/16',
        'a/3 asqr/9 asqrsqr/81'
    ]);
});
