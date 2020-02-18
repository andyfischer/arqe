
import { startSuite } from '.'
const { test } = startSuite();

test('join works', async({run}) => {
    await run('set a b')
    await run('set b c')
    // await run('get a b | join b c')
});
