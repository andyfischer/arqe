"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('get * works on no results', async ({ run }) => {
    const result = await run('get multitest/*');
    expect(result).toEqual([]);
});
_1.test('get * works on single result', async ({ run }) => {
    await run('set multitest/1');
    const result = await run('get multitest/*');
    expect(result).toEqual(['multitest/1']);
});
_1.test('get * works on multiple results result', async ({ run }) => {
    await run('set multitest2/1');
    await run('set multitest2/2');
    await run('set multitest2/3');
    expect(await run('get multitest2/*')).toEqual(['multitest2/1', 'multitest2/2', 'multitest2/3']);
});
_1.test('get * works with additions and deletions', async ({ run }) => {
    await run('set multitest3/1');
    await run('set multitest3/2');
    await run('set multitest3/3');
    expect(await run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3']);
    await run('set multitest3/4');
    expect(await run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/2', 'multitest3/3', 'multitest3/4']);
    await run('delete multitest3/2');
    expect(await run('get multitest3/*')).toEqual(['multitest3/1', 'multitest3/3', 'multitest3/4']);
});
//# sourceMappingURL=GetStar.test.js.map