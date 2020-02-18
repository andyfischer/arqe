
import { startSuite } from '.'
const { test } = startSuite();

test('get with unbound type acts like star', async ({run}) => {
    await run('set a b == 1')
    expect(await run('get a $x')).toEqual(['b == 1']);
});

test('get with unbound value acts like star value', async ({run}) => {
    await run('set a/1 b/1 == 1')
    expect(await run('get a/1 b/$x')).toEqual(['b/1 == 1']);
});
