import { Graph } from ".."
import { setupGraph } from "./utils";

it('strips attrs', () => {
    const { run } = setupGraph({
        provide: {
            'a b c': 'memory',
            'a b': 'memory',
        }
    });

    run('set a b c/1');
    run('set a b c/2');
    run('set a b c/3');
    
    expect(run('get a b c | just c').stringifyBody()).toEqual(['c/1', 'c/2', 'c/3'])
    expect(run('get a b c | just b c').stringifyBody()).toEqual(['b c/1', 'b c/2', 'b c/3'])
})

it(`doesn't include empty tuples`, () => {
    const { run } = setupGraph({
        provide: {
            'a b c': 'memory',
            'a b': 'memory',
        }
    });

    run('set a b/1 c/1');
    run('set a b/2');
    
    expect(run('get a b c?').stringifyBody()).toEqual(['a b/1 c/1', 'a b/2']);
    expect(run('get a b c | just c').stringifyBody()).toEqual(['c/1'])
})
