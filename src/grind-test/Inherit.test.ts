
import { startSuite } from '.'
const { test } = startSuite();

test('returns correct data when inherit tags are used', async ({run}) => {
    await run('set typeinfo/branch .inherits')
    await run('set typeinfo/testcase .inherits')

    await run('set a == 1');
    expect(await run('get a')).toEqual('1')
    expect(await run('get branch/a a')).toEqual('1')
    expect(await run('get testcase/a a')).toEqual('1')
    expect(await run('get testcase/a branch/a a')).toEqual('1')
});

test('get works when accessing inherited tags', async ({run}) => {
    await run('set typeinfo/branch .inherits')

    await run('set tc22 == 1');
    expect(await run('get tc22 branch/123')).toEqual('1')

    await run('set tc22 branch/123 == 2')
    expect(await run('get tc22 branch/123')).toEqual('2');
    expect(await run('get tc22 branch/456')).toEqual('1')
});

test('inherit works with double inherit tags', async ({run}) => {
    await run('set typeinfo/branch .inherits')
    await run('set typeinfo/branch2 .inherits')

    await run('set tc21 == 1');

    expect(await run('get tc21 branch/1')).toEqual('1');
    expect(await run('get tc21 branch2/1')).toEqual('1');
    expect(await run('get tc21 branch/1 branch2/1')).toEqual('1');

    await run('set tc21 branch/1 == 2');

    expect(await run('get tc21')).toEqual('1');
    expect(await run('get tc21 branch/1')).toEqual('2');
    expect(await run('get tc21 branch2/1')).toEqual('1');
    // expect(run('get tc21 branch/1 branch2/1')).toEqual('2'); // this might be poorly defined
});

test('inherit works with valueless tags', async ({run}) => {
    await run('set typeinfo/branch .inherits')
    await run('set typeinfo/branch2 .inherits')

    await run('set a == 1');

    expect(await run('get a branch')).toEqual('1');
    expect(await run('get a branch2')).toEqual('1');
    expect(await run('get a branch branch2')).toEqual('1');
});
