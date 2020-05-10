"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('correctly matches several exact tags', async ({ run }) => {
    await run('set a b c');
    expect(await run('get a b')).toEqual('#null');
    expect(await run('get a b c')).toEqual('#exists');
    expect(await run('get a b c d')).toEqual('#null');
});
//# sourceMappingURL=MultiFixedTags.test.js.map