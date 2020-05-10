"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('get * works with fixed valueless tags', async ({ run }) => {
    await run('set a/1 tc23 c');
    expect(await run('get a/* tc23')).toEqual([]);
    expect(await run('get a/* tc23 c')).toEqual(['a/1']);
    expect(await run('get a/* tc23 c d')).toEqual([]);
});
_1.test('get * works with fixed valueless tags 2', async ({ run }) => {
    await run('set a/1 tc24 c');
    await run('set a/2 tc24 c');
    expect(await run('get a/* tc24 c')).toEqual(['a/1', 'a/2']);
});
//# sourceMappingURL=GetStarMoreTags.test.js.map