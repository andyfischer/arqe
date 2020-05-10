"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const { test } = _1.startSuite();
test('join works', async ({ run }) => {
    await run('set a b/1');
    await run('set b/1 c');
    expect(await run('get a b/$b | join b/$b c')).toEqual(['b/1 c']);
});
//# sourceMappingURL=Join.test.js.map