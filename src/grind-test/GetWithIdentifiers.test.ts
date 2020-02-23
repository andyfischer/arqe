
import { startSuite } from '.'
const { test } = startSuite();

test('get results include identifiers', async ({run}) => {
    await run(`set tc30/1`);
    await run(`set tc30/2`);
    // expect(await run(`get tc30/$a`)).toEqual([])
});
