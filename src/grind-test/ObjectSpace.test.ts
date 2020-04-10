
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

test('ObjectSpace attributes exclude multiple values', async ({run}) => {
    await run('set object-type/ot');
    await run('set object-type/ot attribute attr1');
    await run('set ot/ot2');

    expect(await run('get ot/ot2 attr1/*')).toEqual([]);
    await run('set ot/ot2 attr1/1');
    expect(await run('get ot/ot2 attr1/*')).toEqual(["attr1/1"]);
    await run('set ot/ot2 attr1/2');
    expect(await run('get ot/ot2 attr1/*')).toEqual(["attr1/2"]);
});
