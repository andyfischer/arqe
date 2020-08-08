
import Graph from "../Graph";
import { run } from './utils'

it('join works', () => {
    const graph = new Graph();

    run(graph, 'set a32 b/1')
    run(graph, 'set a32 b/2')
    run(graph, 'set a32 b/3')
    run(graph, 'set b/1 c32')
    run(graph, 'set b/4 c32')
    expect(run(graph, 'get a32 b/$b | join b/$b c32', { withHeaders: true })).toEqual([
        'a32 b/$b command-meta search-pattern c32',
        'a32 [from $b] b/1 c32'
    ]);
});

xit('double join works', () => {
    const graph = new Graph();

    run(graph, 'set a33 b/1')
    run(graph, 'set a33 b/2')
    run(graph, 'set a33 b/3')
    run(graph, 'set b/1 c33/1')
    run(graph, 'set b/4 c33/1')
    run(graph, 'set c33/1 d/1')
    run(graph, 'set c33/1 d/2')
    expect(run(graph, 'get a33 b/$b | join b/$b c33/$c | join c33/$c d/*')).toEqual(
    [
        'a33 b/$b c32 command-meta search-pattern c32',
        'a33 [from $b] b/1 [from $c] c33/1 d/1',
        'a33 [from $b] b/1 [from $c] c33/1 d/2'
    ]);
});

// todo: write 'diff relations' and 'expect relations equal'