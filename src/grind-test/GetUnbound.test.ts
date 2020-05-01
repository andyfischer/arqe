
import { test } from '.'

test('get with unbound type acts like star', async ({run}) => {
    await run('set a b val(1)')
    expect(await run('get a $x val/*')).toEqual(['b val/1']);
});

test('get with unbound value acts like star value', async ({run}) => {
    await run('set a/1 b/1 val(1)')
    expect(await run('get a/1 b/$x val/*')).toEqual(['b/1 val/1']);
});
