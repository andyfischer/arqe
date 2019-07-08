
import { test } from '.'

test('get -count works', async({run}) => {
    expect(await run('get -count counttest/*')).toEqual('0');
    await run('set counttest/1');
    expect(await run('get -count counttest/*')).toEqual('1');
    await run('set counttest/2');
    await run('set counttest/3');
    expect(await run('get -count counttest/*')).toEqual('3');
});
