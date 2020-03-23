
import { startSuite } from '.'
const { test } = startSuite();

test('inc command works', async ({run}) => {
    await run('set a b == 1');
    // await run('inc a b');
});
