
import { startSuite } from '.'
const { test } = startSuite();

test('returns correct data when inherit tags are used', ({run}) => {
    run('set typeinfo/branch .inherits')
    run('set typeinfo/testcase .inherits')

    run('set a == 1');
    expect(run('get a')).toEqual('1')
    expect(run('get branch/a a')).toEqual('1')
    expect(run('get testcase/a a')).toEqual('1')
    expect(run('get testcase/a branch/a a')).toEqual('1')
});

test('get works when accessing inherited tags', ({run}) => {
    run('set typeinfo/branch .inherits')

    run('set a == 1');
    expect(run('get a branch/123')).toEqual('1')

    run('set a branch/123 == 2')
    expect(run('get a branch/123')).toEqual('2');
    expect(run('get a branch/456')).toEqual('1')
});

test('works with double inherit tags', ({run}) => {
    run('set typeinfo/branch .inherits')
    run('set typeinfo/branch2 .inherits')

    run('set a == 1');

    expect(run('get a branch/1')).toEqual('1');
    expect(run('get a branch2/1')).toEqual('1');
    expect(run('get a branch/1 branch2/1')).toEqual('1');

    run('set a branch/1 == 2');

    expect(run('get a')).toEqual('1');
    expect(run('get a branch/1')).toEqual('2');
    expect(run('get a branch2/1')).toEqual('1');
    // expect(run('get a branch/1 branch2/1')).toEqual('2'); // this might be poorly defined
});

test('works with valueless tags', ({run}) => {
    run('set typeinfo/branch .inherits')
    run('set typeinfo/branch2 .inherits')

    run('set a == 1');

    expect(run('get a branch')).toEqual('1');
    expect(run('get a branch2')).toEqual('1');
    expect(run('get a branch branch2')).toEqual('1');
});
