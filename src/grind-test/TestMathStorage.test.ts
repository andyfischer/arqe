
import { test } from '.'

test('test-math works', async({run}) => {
    expect(await run('get test-math a/2 b/2 sum/*')).toEqual(['sum/4']);
    expect(await run('get test-math a/4 b/9 sum/*')).toEqual(['sum/13']);
});
