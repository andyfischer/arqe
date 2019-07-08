
import { test } from '.'

test('empty get works', async ({run}) => {
    expect(await run('get')).toEqual('#null');
});
