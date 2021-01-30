
import { setupGraph } from './utils'

test('empty get works', () => {
    const { run } = setupGraph();
    expect(run('get').stringifyBody()).toEqual([]);
});

it("passes through rows from input", () => {
    const { run, graph } = setupGraph({
        provide: {
            'a v': 'memory',
            'b v': 'memory'
        }
    });

    run("set a v/1");
    run("set a v/2");
    run("set b v/3");
    expect(run('get a v | get b v').stringifyBody()).toEqual([
        "a v/1",
        "a v/2",
        "b v/3"
    ]);
});
