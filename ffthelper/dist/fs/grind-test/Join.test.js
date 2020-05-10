"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const { test } = _1.startSuite();
test('join works', async ({ run }) => {
    await run('set a32 b/1');
    await run('set a32 b/2');
    await run('set a32 b/3');
    await run('set b/1 c32');
    await run('set b/4 c32');
    expect(await run('get a32 b/$b | join b/$b c32')).toEqual(['[from $b] b/1 c32']);
});
test('double join works', async ({ run }) => {
    await run('set a33 b/1');
    await run('set a33 b/2');
    await run('set a33 b/3');
    await run('set b/1 c33/1');
    await run('set b/4 c33/1');
    await run('set c33/1 d/1');
    await run('set c33/1 d/2');
    expect(await run('get a33 b/$b | join b/$b c33/$c | join c33/$c d/*')).toEqual(['[from $b] b/1 [from $c] c33/1 d/1',
        '[from $b] b/1 [from $c] c33/1 d/2']);
});
