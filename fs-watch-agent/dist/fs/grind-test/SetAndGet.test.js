"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test("initially doesn't have a value", async ({ run }) => {
    const existing = await run('get testval/1');
    expect(existing).toEqual('#null');
});
_1.test("set and get #exists", async ({ run }) => {
    const existing = await run('get testval/2');
    expect(existing).toEqual('#null');
    await run('set testval/2');
    const found = await run('get testval/2');
    expect(found).toEqual('#exists');
});
_1.test("overwrite set and get the value", async ({ run }) => {
    await run('delete tc26/*');
    const existing = await run('get tc26/4');
    expect(existing).toEqual('#null');
    await run('set tc26/4 == 123');
    const found = await run('get tc26/4');
    expect(found).toEqual('123');
    await run('set tc26/4 == 456');
    const found2 = await run('get tc26/4');
    expect(found2).toEqual('456');
});
_1.test("overwrite value with #exists", async ({ run }) => {
    await run('delete tc25/*');
    const existing = await run('get tc25/5');
    expect(existing).toEqual('#null');
    await run('set tc25/5 == 123');
    const found = await run('get tc25/5');
    expect(found).toEqual('123');
    await run('set tc25/5');
    const found2 = await run('get tc25/5');
    expect(found2).toEqual('#exists');
});
_1.test("overwrite #exists with value", async ({ run }) => {
    await run('delete tc24/*');
    const existing = await run('get tc24/6');
    expect(existing).toEqual('#null');
    await run('set tc24/6');
    const found = await run('get tc24/6');
    expect(found).toEqual('#exists');
    await run('set tc24/6 == 123');
    const found2 = await run('get tc24/6');
    expect(found2).toEqual('123');
});
//# sourceMappingURL=SetAndGet.test.js.map