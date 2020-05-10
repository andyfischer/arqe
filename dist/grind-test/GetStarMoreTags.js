"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestSuite_1 = require("./TestSuite");
const { test } = TestSuite_1.startSuite();
test('get * works with fixed valueless tags', async ({ run }) => {
    await run('set a/1 b c');
    expect(await run('get a/* b')).toEqual([]);
    expect(await run('get a/* b c')).toEqual(['a/1']);
    expect(await run('get a/* b c d')).toEqual([]);
});
test('get * works with fixed valueless tags 2', async ({ run }) => {
    await run('set a/1 b c');
    await run('set a/2 b c');
    expect(await run('get a/* b c')).toEqual(['a/1', 'a/2']);
});
test('get * works with fixed valueless tags 3', async ({ run }) => {
    expect(await run('set a/1 b c')).toEqual('#done');
    expect(await run('set a/2 b c')).toEqual('#done');
    expect(await run('get a/* b c')).toEqual(['a/1', 'a/2']);
    await run('set a/1 b/1');
    await run('set a/2 b/1');
    await run('set a/3 b/2');
    expect(await run('get a/* b/1')).toEqual(['a/1', 'a/2']);
});
test('get * works with fixed value tag', async ({ run }) => {
    expect(await run('set a/1 b c')).toEqual('#done');
    expect(await run('set a/2 b c')).toEqual('#done');
    expect(await run('get a/* b c')).toEqual(['a/1', 'a/2']);
    await run('set a/1 b/1');
    await run('set a/2 b/1');
    await run('set a/3 b/2');
    expect(await run('get a/* b/1')).toEqual(['a/1', 'a/2']);
});
test('get * works with fixed value tag 2', async ({ run }) => {
    await run('set a/1 b/1');
    await run('set a/2 b/1');
    await run('set a/3 b/2');
    expect(await run('get a/* b/2')).toEqual(['a/3']);
});
test('get * works with fixed value tag 3', async ({ run }) => {
    await run('set a/1 b');
    await run('set a/2 b');
    await run('set a/3 c');
    expect(await run('get a/* b')).toEqual(['a/1', 'a/2']);
    expect(await run('get a/* c')).toEqual(['a/3']);
});
//# sourceMappingURL=GetStarMoreTags.js.map