"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const { test } = _1.startSuite();
test('get -exists works', async ({ run }) => {
    expect(await run('get -exists existstest/*')).toEqual('#null');
    await run('set existstest/1');
    expect(await run('get -exists existstest/*')).toEqual('#exists');
    await run('set existstest/2');
    await run('set existstest/3');
    expect(await run('get -exists existstest/*')).toEqual('#exists');
});
//# sourceMappingURL=GetExists.test.js.map