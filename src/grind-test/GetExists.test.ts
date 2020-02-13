
import { startSuite } from '.'
const { test } = startSuite();

test('get -exists works', async({run}) => {
    expect(await run('get -exists existstest/*')).toEqual('#null');
    await run('set existstest/1');
    expect(await run('get -exists existstest/*')).toEqual('#exists');
    await run('set existstest/2');
    await run('set existstest/3');
    expect(await run('get -exists existstest/*')).toEqual('#exists');
});
