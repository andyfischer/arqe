
import { startSuite } from '.'
const { test } = startSuite();

test('can get on an object-space column', async ({run}) => {
    await run('set object-type/ot');
    await run('set object-type/ot attribute attr1');

    expect(await run('get ot/ot1')).toEqual('#null');
    await run('set ot/ot1')
    expect(await run('get ot/ot1')).toEqual('#exists');
    expect(await run('get ot/ot2')).toEqual('#null');

    expect(await run('get ot/ot1 attr1/*')).toEqual([]);
    await run('set ot/ot1 attr1/test')
    expect(await run('get ot/ot1 attr1/*')).toEqual(['attr1/test']);
});