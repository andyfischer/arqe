"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('get results include identifiers', async ({ run }) => {
    await run(`set tc30/1`);
    await run(`set tc30/2`);
    return;
    expect(await run(`get tc30/$a`)).toEqual([
        '[from $a] tc30/1',
        '[from $a] tc30/2'
    ]);
});
//# sourceMappingURL=GetWithIdentifiers.test.js.map