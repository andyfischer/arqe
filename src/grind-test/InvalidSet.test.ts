

import { startSuite } from '.'
const { test } = startSuite();

test("can't set with *", ({run}) => {
    expect(run('set *', { allowError: true })).toMatch(/^#error/);
    expect(run('set **', { allowError: true })).toMatch(/^#error/);
    expect(run('set a/*', { allowError: true })).toMatch(/^#error/);
});
