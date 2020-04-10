
import { startSuite } from '.'
const { test } = startSuite();

test('modify increment value', async ({run}) => {
    await run('set a/1 b/1');
    await run('modify a/1 b/(increment)');
    expect(await run('get a/1 b/*')).toEqual(['b/2']);
});
