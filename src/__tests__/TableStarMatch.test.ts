
import { setupGraph } from './utils'

xit("works", () => {
    const { graph, run } = setupGraph();

    graph.provide({
        'star-table args(star)': {
            'find args': (input, out) => {
                out.done({'star-table': 'saw: ' + input.stringify()});
            }
        }
    });
    
    expect(run('star-table').stringifyBody()).toEqual(['...']);
    expect(run('star-table a=1 b=2 c=3').stringifyBody()).toEqual([]);
});

it("prioritizes star patterns first", () => {
});

