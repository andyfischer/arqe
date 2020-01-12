
import { startSuite } from './TestSuite'
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

test('get works when accessing inheirited tags', ({run}) => {
});

test('inherited tags can be assigned values', ({run}) => {
});
