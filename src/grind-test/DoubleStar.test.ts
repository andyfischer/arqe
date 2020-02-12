
import { startSuite } from '.'
const { test } = startSuite();

test('double star tag works', async ({run}) => {
    await run('set a b c');
    //expect(await run('get a **')).toEqual(['b c']);
    //expect(await run('get d **')).toEqual('#null');
});
