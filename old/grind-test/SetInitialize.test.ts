
import { test } from '.'

test(`'set' initializes a new slot if needed`, async ({run}) => {
    await run('set a/1 b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2'])
    await run('set a/1 b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2'])
    await run('set a/1 b/(set 3)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/3'])
});

test(`double 'set' works`, async ({run}) => {
    await run('set a/(set 1) b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2'])
    await run('set a/(set 1) b/(set 2)');
    expect(await run('get a/* b/*')).toEqual(['a/1 b/2'])
    await run('set a/(set 2) b/(set 3)');
    expect(await run('get a/* b/*')).toEqual(['a/2 b/3'])
});

test(`'set' and 'increment' work`, async ({run}) => {
    await run('set a/1 b/2');
    expect(await run('set a/(increment) b/(set 4)')).toEqual(['a/2 b/4'])
});
