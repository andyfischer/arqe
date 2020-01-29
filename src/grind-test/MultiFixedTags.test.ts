
import { startSuite } from '.'
const { test } = startSuite();

test('correctly matches several exact tags', async ({run}) => {
    await run('set a b c');
    expect(await run('get a b')).toEqual('#null');
    expect(await run('get a b c')).toEqual('#exists');
    expect(await run('get a b c d')).toEqual('#null');
});
