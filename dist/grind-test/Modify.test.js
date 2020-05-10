"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('modify increment value', async ({ run }) => {
    await run('set modify-test1 a/1 b/1');
    await run('modify modify-test1 a/1 b/(increment)');
    expect(await run('get modify-test1 a/1 b/*')).toEqual(['b/2']);
});
//# sourceMappingURL=Modify.test.js.map