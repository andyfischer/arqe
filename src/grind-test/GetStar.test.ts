
import { run } from './Setup'

it('get * works on no results', () => {
    const result = run('get multitest/*');
    expect(result).toEqual([]);
});

it('get * works on single result', () => {
    run('set multitest/1');
    const result = run('get multitest/*');
    expect(result).toEqual(['multitest/1']);
});

it('get * works on multiple results result', () => {
    run('set multitest2/1');
    run('set multitest2/2');
    run('set multitest2/3');
    expect(run('get multitest2/*')).toEqual(['multitest2/1', 'multitest2/2', 'multitest2/3']);
});

it('get * works with additions and deletions', () => {
    run('set multitest3/1');
    run('set multitest3/2');
    run('set multitest3/3');
    expect(run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3']);

    run('set multitest3/4');
    expect(run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3', 'multitest3/4']);

    run('delete multitest3/2');
    expect(run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/3', 'multitest3/4']);
});
