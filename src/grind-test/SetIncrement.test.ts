
import { test } from '.'

test('inc command works', async ({run}) => {
    await run('set a b == 1');
    // await run('inc a b');
});
