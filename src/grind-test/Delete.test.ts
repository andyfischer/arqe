
import { startSuite } from '.'
const { test } = startSuite();

test('delete works', async ({run}) => {
    await run('set deletetest/1');
    expect(await run('delete deletetest/1')).toEqual('#done');
    expect(await run('get deletetest/1')).toEqual('#null');
});

test('delete * works', async ({run}) => {
    await run('set deletetest/1');
    await run('set deletetest/2');
    await run('set deletetest/3');
    expect(await run('delete deletetest/*')).toEqual('#done');
    expect(await run('get deletetest/1')).toEqual('#null');
    expect(await run('get deletetest/2')).toEqual('#null');
    expect(await run('get deletetest/3')).toEqual('#null');
});

test('delete t1/x t2/*', async ({run}) => {
    await run('set deletetest/1 t2/1');
    await run('set deletetest/1 t2/2');
    await run('set deletetest/2 t2/1');
    expect(await run('delete deletetest/1 t2/*')).toEqual('#done');
    expect(await run('get deletetest/1 t2/1')).toEqual('#null');
    expect(await run('get deletetest/1 t2/2')).toEqual('#null');
    expect(await run('get deletetest/2 t2/1')).toEqual('#exists');
});
