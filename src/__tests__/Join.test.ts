
import Graph from "../Graph";
import { run } from './utils'

it('join works', () => {
    const graph = new Graph({
        provide: {
            'a b': 'memory',
            'b c': 'memory',
            'c d': 'memory'
        }
    });

    run(graph, 'set a b/1')
    run(graph, 'set a b/2')
    run(graph, 'set a b/3')
    run(graph, 'set b/1 c')
    run(graph, 'set b/4 c')
    expect(run(graph, 'get a b/$b | join b/$b c', { withHeaders: true })).toEqual([
        'a b/$b c command-meta search-pattern',
        'a [from $b] b/1 c'
    ]);
});

xit('double join works', () => {
    const graph = new Graph();

    run(graph, 'set a b/1')
    run(graph, 'set a b/2')
    run(graph, 'set a b/3')
    run(graph, 'set b/1 c/1')
    run(graph, 'set b/4 c/1')
    run(graph, 'set c/1 d/1')
    run(graph, 'set c/1 d/2')
    expect(run(graph, 'get a b/$b | join b/$b c/$c | join c/$c d/*')).toEqual(
    [
        'a b/$b c command-meta search-pattern',
        'a [from $b] b/1 [from $c] c/1 d/1',
        'a [from $b] b/1 [from $c] c/1 d/2'
    ]);
});

// todo: write 'diff relations' and 'expect relations equal'
