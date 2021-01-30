
import Graph from '../Graph'
import { setupGraph } from './utils'

it('test-math works', () => {
    const { run, graph } = setupGraph({
        provide: {
            'test-math sum a b': {
                'find a b'(i,o) {
                    const { a, b } = i.obj();
                    o.done({sum: parseInt(a) + parseInt(b) + ''});
                }
            }
        }
    });

    expect(run('get test-math a=2 b=2 sum').stringifyBody()).toEqual([
        'test-math sum/4 a/2 b/2'
    ]);
    expect(run('get test-math a=4 b=9 sum').stringifyBody()).toEqual([
        'test-math sum/13 a/4 b/9'
    ]);
});
