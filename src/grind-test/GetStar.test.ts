
import { startSuite } from './TestSuite'
const { test } = startSuite();

test('get * works on no results', ({run}) => {
    const result = run('get multitest/*');
    expect(result).toEqual([]);
});

test('get * works on single result', ({run}) => {
    run('set multitest/1');
    const result = run('get multitest/*');
    expect(result).toEqual(['multitest/1']);
});

test('get * works on multiple results result', ({run}) => {
    run('set multitest2/1');
    run('set multitest2/2');
    run('set multitest2/3');
    expect(run('get multitest2/*')).toEqual(['multitest2/1', 'multitest2/2', 'multitest2/3']);
});

test('get * works with additions and deletions', ({run}) => {
    run('set multitest3/1');
    run('set multitest3/2');
    run('set multitest3/3');
    expect(run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3']);

    run('set multitest3/4');
    expect(run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3', 'multitest3/4']);

    run('delete multitest3/2');
    expect(run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/3', 'multitest3/4']);
});
