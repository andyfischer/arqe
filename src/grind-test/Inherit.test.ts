
import { test } from '.'

it('works', () => {});

/*
test('returns correct data when inherit tags are used', async ({run}) => {
    await run('set typeinfo/branch .inherits')
    await run('set typeinfo/testcase .inherits')

    await run('set a val/1');
    expect(await run('get a val')).toEqual('val/1')
    expect(await run('get branch/a a val')).toEqual('val/1')
    expect(await run('get testcase/a a val')).toEqual('val/1')
    expect(await run('get testcase/a branch/a a val')).toEqual('val/1')
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
    expect(await run('get tc21 branch/1 branch2/1')).toEqual('2');
});

test('inherit correctly prioritizes multiple inherits', async ({run}) => {
    await run('set typeinfo/a-branch .inherits')
    await run('set typeinfo/b-branch .inherits')
    await run('set typeinfo/c-branch .inherits')

    // Branch order is a, b, c
    // After trying a+b+c, the next thing to try is a+b, then a.

    await run('set a-branch b-branch == ab')
    await run('set b-branch c-branch == bc')
    await run('set a-branch c-branch == ac')

    expect(await run('get a-branch b-branch c-branch')).toEqual('ab');

    await run('set bottom a-branch == a bottom')
    await run('set bottom b-branch == b bottom')
    await run('set bottom c-branch == c bottom')

    expect(await run('get bottom a-branch b-branch c-branch')).toEqual('a bottom');
});

test('inherit respects tag ordering', async ({run}) => {
    await run('set typeinfo/a-branch-2 .inherits')
    await run('set typeinfo/b-branch-2 .inherits')
    await run('set typeinfo/c-branch-2 .inherits')
    await run('set typeinfo/b-branch-2 .order == after')
    await run('set typeinfo/c-branch-2 .order == before')
    
    // Branch order is c, a, b
    // After trying a+b+c, the next thing to try is a+c, then c.

    await run('set a-branch-2 b-branch-2 == ab')
    await run('set b-branch-2 c-branch-2 == bc')
    await run('set a-branch-2 c-branch-2 == ac')

    expect(await run('get a-branch-2 b-branch-2 c-branch-2')).toEqual('ac');

    await run('set bottom a-branch-2 == a bottom')
    await run('set bottom b-branch-2 == b bottom')
    await run('set bottom c-branch-2 == c bottom')

    expect(await run('get bottom a-branch-2 b-branch-2 c-branch-2')).toEqual('c bottom');
});

test('inherit works with valueless tags', async ({run}) => {
    await run('set typeinfo/branch .inherits')
    await run('set typeinfo/branch2 .inherits')

    await run('set a == 1');

    expect(await run('get a branch')).toEqual('1');
    expect(await run('get a branch2')).toEqual('1');
    expect(await run('get a branch branch2')).toEqual('1');
});
*/
