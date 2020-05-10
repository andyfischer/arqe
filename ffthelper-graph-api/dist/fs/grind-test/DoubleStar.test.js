"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const { test } = _1.startSuite();
test('double star tag works', async ({ run }) => {
    await run('set a b c');
    expect(await run('get a **')).toEqual(['b c']);
    expect(await run('get d **')).toEqual([]);
});
test('double star matches correctly', async ({ run }) => {
    await run('set a');
    await run('set a b');
    await run('set a b c');
    await run('set a b d');
    expect((await run('get a **')).sort()).toEqual(['b', 'b c', 'b d']);
    expect((await run('get a b **')).sort()).toEqual(['c', 'd']);
    expect((await run('get b **')).sort()).toEqual(['a', 'a c', 'a d']);
    expect((await run('get c **')).sort()).toEqual(['a b']);
});
