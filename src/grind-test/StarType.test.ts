
import { test } from '.'

test('star tag works', async ({run}) => {
    await run('set a b');
    expect(await run('get a *')).toEqual(['b']);
});

test('star tag works 2', async ({run}) => {
    await run('set a b c/1');
    expect(await run('get * b c/1')).toEqual(['a']);
});
