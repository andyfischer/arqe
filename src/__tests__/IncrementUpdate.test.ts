import { setupGraph } from "./utils";
import { Graph } from '..';

it('increment expression works', () => {
    const { run, graph } = setupGraph({
        provide: {
            'a b': 'memory',
            'file-watch filename version': 'memory'
        }
    });
    run('set a=1 b=1');
    run('set a(increment) b');
    expect(run('get a b').stringifyBody()).toEqual(['a/2 b/1']);

    run('set a(increment) b');
    expect(run('get a b').stringifyBody()).toEqual(['a/3 b/1']);

    run('set a(increment) b(increment)');
    expect(run('get a b').stringifyBody()).toEqual(['a/4 b/2']);

    run('set a=1 b(increment)');
    expect(run('get a b').stringifyBody()).toEqual(['a/4 b/2']);
});
