

import { startSuite } from '.'
const { test } = startSuite();

test("can't set with *", async ({run}) => {
    expect(await run('set *', { allowError: true })).toMatch(/^#error/);
    expect(await run('set **', { allowError: true })).toMatch(/^#error/);
    expect(await run('set a/*', { allowError: true })).toMatch(/^#error/);
});
