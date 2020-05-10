"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('overwrite', async ({ run }) => {
    const object = 'tc20/1';
    await run(`set ${object}`);
    expect(await run(`get ${object}`)).toEqual('#exists');
    await run(`set ${object} == 1`);
    expect(await run(`get ${object}`)).toEqual('1');
    await run(`set ${object}`);
    expect(await run(`get ${object}`)).toEqual('#exists');
});
//# sourceMappingURL=Overwrite.test.js.map