"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('star tag works', async ({ run }) => {
    await run('set a b');
    expect(await run('get a *')).toEqual(['b']);
});
_1.test('star tag works 2', async ({ run }) => {
    await run('set a b c/1');
    expect(await run('get * b c/1')).toEqual(['a']);
});
//# sourceMappingURL=StarType.test.js.map