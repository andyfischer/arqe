"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const { test } = _1.startSuite();
test("can't set with *", async ({ run }) => {
    expect(await run('set *', { allowError: true })).toMatch(/^#error/);
    expect(await run('set **', { allowError: true })).toMatch(/^#error/);
    expect(await run('set a/*', { allowError: true })).toMatch(/^#error/);
});
//# sourceMappingURL=InvalidSet.test.js.map