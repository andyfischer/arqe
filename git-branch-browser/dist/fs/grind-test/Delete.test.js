"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('delete works', async ({ run }) => {
    await run('set deletetest/1');
    expect(await run('delete deletetest/1')).toEqual(['deleted deletetest/1']);
    expect(await run('get deletetest/1')).toEqual('#null');
});
_1.test('delete * works', async ({ run }) => {
    await run('set deletetest/1');
    await run('set deletetest/2');
    await run('set deletetest/3');
    expect(await run('delete deletetest/*')).toEqual(['deleted deletetest/1', 'deleted deletetest/2', 'deleted deletetest/3']);
    expect(await run('get deletetest/1')).toEqual('#null');
    expect(await run('get deletetest/2')).toEqual('#null');
    expect(await run('get deletetest/3')).toEqual('#null');
});
_1.test('delete t1/x t2/*', async ({ run }) => {
    await run('set deletetest/1 t2/1');
    await run('set deletetest/1 t2/2');
    await run('set deletetest/2 t2/1');
    expect(await run('delete deletetest/1 t2/*')).toEqual(['deleted deletetest/1 t2/1', 'deleted deletetest/1 t2/2']);
    expect(await run('get deletetest/1 t2/1')).toEqual('#null');
    expect(await run('get deletetest/1 t2/2')).toEqual('#null');
    expect(await run('get deletetest/2 t2/1')).toEqual('#exists');
});
//# sourceMappingURL=Delete.test.js.map