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
//# sourceMappingURL=SetAndGet.test.js.map