
import { setupGraph } from './utils'

function setup() {
    return setupGraph({
        provide: {
            multitest: 'memory',
            'a b': 'memory',
            'a b c': 'memory',
            'a b c d': 'memory',
            'touchpoint output var from': 'memory',
        }
    });
}
it('get * works on no results', () => {
    const { run } = setup();
    const result = run('get multitest/*').stringifyBody();
    expect(result).toEqual([]);
});

it('get * works on single result', () => {
    const { run } = setup();
    run('set multitest/1');
    const result = run('get multitest/*').stringifyBody();
    expect(result).toEqual(['multitest/1']);
});

it('get * works on multiple results result', () => {
    const { run } = setup();
    run('set multitest/1');
    run('set multitest/2');
    run('set multitest/3');
    expect(run('get multitest/*').stringifyBody()).toEqual(['multitest/1', 'multitest/2', 'multitest/3']);
});

it('get * works with additions and deletions', () => {
    const { run } = setup();
    run('set multitest/1');
    run('set multitest/2');
    run('set multitest/3');
    expect(run('get multitest/*').stringifyBody()).toEqual(['multitest/1', 'multitest/2', 'multitest/3']);

    run('set multitest/4');
    expect(run('get multitest/*').stringifyBody()).toEqual(['multitest/1', 'multitest/2', 'multitest/3', 'multitest/4']);

    run('delete multitest/2');
    expect(run('get multitest/*').stringifyBody()).toEqual(['multitest/1', 'multitest/3', 'multitest/4']);
});

it('get works with different tag order', () => {
    const { run } = setup();
    run('set touchpoint/touchpointInputs2 output var/varStr from(var/*)');
    run('set touchpoint/touchpointInputs2 output var/typeStr from(type/*)');

    expect(run('get touchpoint/touchpointInputs2 output from/* var/*').stringifyBody()).toEqual([
        'touchpoint/touchpointInputs2 output var/varStr from(var/*)',
        'touchpoint/touchpointInputs2 output var/typeStr from(type/*)'
    ]);
})

it('get * works with fixed valueless tags', () => {
    const { run } = setup();
    run('set a/1 b c')
    expect(run('get a/* b').stringifyBody()).toEqual([]);
    expect(run('get a/* b c').stringifyBody()).toEqual(['a/1 b c']);
    expect(run('get a/* b c d').stringifyBody()).toEqual([]);
});

it('get * works with fixed valueless tags 2', () => {
    const { run } = setup();
    run('set a=1 b c')
    run('set a=2 b c')
    expect(run('get a/* b c').stringifyBody()).toEqual([
        'a/1 b c',
        'a/2 b c'
    ]);
});
