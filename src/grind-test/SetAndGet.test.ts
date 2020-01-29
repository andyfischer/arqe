
import { startSuite } from '.'
const { test } = startSuite();

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

test("set and get payload", async ({run}) => {
    const existing = await run('get testval/3');
    expect(existing).toEqual('#null');

    await run('set testval/3 == 123');
    const found = await run('get testval/3');
    expect(found).toEqual('123');
});

test("overwrite set and get the value", async ({run}) => {
    const existing = await run('get testval/4');
    expect(existing).toEqual('#null');

    await run('set testval/4 == 123');
    const found = await run('get testval/4');
    expect(found).toEqual('123');

    await run('set testval/4 == 456');
    const found2 = await run('get testval/4');
    expect(found2).toEqual('456');
});

test("overwrite value with #exists", async ({run}) => {
    const existing = await run('get testval/5');
    expect(existing).toEqual('#null');

    await run('set testval/5 == 123');
    const found = await run('get testval/5');
    expect(found).toEqual('123');

    await run('set testval/5');
    const found2 = await run('get testval/5');
    expect(found2).toEqual('#exists');
});

test("overwrite #exists with value", async ({run}) => {
    const existing = await run('get testval/6');
    expect(existing).toEqual('#null');

    await run('set testval/6');
    const found = await run('get testval/6');
    expect(found).toEqual('#exists');

    await run('set testval/6 == 123');
    const found2 = await run('get testval/6');
    expect(found2).toEqual('123');
});
