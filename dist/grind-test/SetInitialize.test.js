"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test(`'set' initializes a new slot if needed`, async ({ run }) => {
    await run('set a/1 b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2']);
    await run('set a/1 b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2']);
    await run('set a/1 b/(set 3)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/3']);
});
_1.test(`double 'set' works`, async ({ run }) => {
    await run('set a/(set 1) b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2']);
    await run('set a/(set 1) b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2']);
    await run('set a/(set 2) b/(set 3)');
    expect(await run('get a/* b/*')).toEqual(['a/2 b/3']);
});
_1.test(`'set' and 'increment' work`, async ({ run }) => {
    await run('set a/1 b/2');
    expect(await run('set a/(increment) b/(set 4)')).toEqual(['a/2 b/4']);
});
//# sourceMappingURL=SetInitialize.test.js.map