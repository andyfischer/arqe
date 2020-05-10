"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('increment expression works', async ({ run }) => {
    await run('set a/1 b/1');
    await run('set a/(increment) b/*');
    expect(await run('get a/* b/*')).toEqual(['a/2 b/1']);
    await run('set a/(increment) b/*');
    expect(await run('get a/* b/*')).toEqual(['a/3 b/1']);
    await run('set a/(increment) b/(increment)');
    expect(await run('get a/* b/*')).toEqual(['a/4 b/2']);
    await run('set a/1 b/(increment)');
    expect(await run('get a/* b/*')).toEqual(['a/4 b/2']);
});
//# sourceMappingURL=SetIncrement.test.js.map