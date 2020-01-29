
import { startSuite } from '.'
const { test } = startSuite();

test('overwrite', async ({run}) => {
    await run('set d/1');
    expect(await run('get d/1')).toEqual('#exists');

    await run('set d/1 == 1')
    expect(await run('get d/1')).toEqual('1');

    await run('set d/1')
    expect(await run('get d/1')).toEqual('#exists');
});

