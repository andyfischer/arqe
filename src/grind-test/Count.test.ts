
import { test } from '.'


test('empty count', async ({run}) => {
    expect(await run('count')).toEqual(['count/0']);
});

test('count search', async ({run}) => {
    expect(await run('count a/*')).toEqual(['count/0']);
    await run('set a/1');
    expect(await run('count a/*')).toEqual(['count/1']);
    await run('set a/2');
    await run('set a/3');
    await run('set a/4');
    expect(await run('count a/*')).toEqual(['count/4']);
});

test('count piped', async ({run}) => {
    expect(await run('get a/* | count')).toEqual(['count/0']);
    await run('set a/1');
    expect(await run('get a/* | count')).toEqual(['count/1']);
    await run('set a/2');
    await run('set a/3');
    await run('set a/4');
    expect(await run('get a/* | count')).toEqual(['count/4']);
});

test('count search and piped', async ({run}) => {
    expect(await run('get a/* | count b/*')).toEqual(['count/0']);
    await run('set a/1');
    expect(await run('get a/* | count b/*')).toEqual(['count/1']);
    await run('set b/1');
    expect(await run('get a/* | count b/*')).toEqual(['count/2']);
    await run('set a/2');
    await run('set a/3');
    await run('set a/4');
    expect(await run('get a/* | count b/*')).toEqual(['count/5']);
    await run('set b/2');
    await run('set b/3');
    await run('set b/4');
    expect(await run('get a/* | count b/*')).toEqual(['count/8']);
});
