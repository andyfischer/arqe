
import { setupGraph } from './utils'

it('works', () => {
    const { run } = setupGraph();

    expect(run('val x=a y=c | val x=c y=a | val x=b y=b | order-by x').stringifyBody()).toEqual([
        'x/a y/c',
        'x/b y/b',
        'x/c y/a',
    ]);
    
    expect(run('val x=a y=c | val x=c y=a | val x=b y=b | order-by y').stringifyBody()).toEqual([
        'x/c y/a',
        'x/b y/b',
        'x/a y/c',
    ]);
});
