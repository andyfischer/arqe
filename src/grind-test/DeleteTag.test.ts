
import { test } from '.'

test(`adding 'deleted' relation is equivalent to the 'delete' command`, async ({run}) => {

    await run('set a/1');
    await run('set a/2');
    await run('set a/3');

    expect(await run('get a/*')).toEqual(['a/1', 'a/2', 'a/3']);

    await run('set a/2 deleted/(set 1)');

    expect(await run('get a/*')).toEqual(['a/1', 'a/3']);
});

