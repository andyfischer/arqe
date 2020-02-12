
import { startSuite } from '.'
const { test } = startSuite();

test('star tag works', async ({run}) => {
    await run('set a b');
    expect(await run('get a *')).toEqual('#exists');
});

test('star tag works 2', async ({run}) => {
    await run('set a b c/1');
    expect(await run('get * b c/1')).toEqual('#exists');
});
