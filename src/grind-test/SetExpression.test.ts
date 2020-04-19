
import { test } from '.'

test('set expression works', async ({run}) => {
    expect(await run('set a b c/1')).toEqual(['a b c/1'])
    expect(await run('set a b c/(set 2)')).toEqual(['a b c/2']);
});
