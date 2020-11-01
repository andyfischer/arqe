
import { test } from '.'

test("initially doesn't have a value", async ({run}) => {
    const existing = await run('get testval/1');
    expect(existing).toEqual('#null');
});

test("set and get #exists", async ({run}) => {
    const existing = await run('get testval/2');
    expect(existing).toEqual('#null');

    await run('set testval/2');
    const found = await run('get testval/2');
    expect(found).toEqual('#exists');
});

