
import { test } from '.'

test('listen works', async ({set, listen}) => {

    const getResults = listen('a/*');
    await set('a/1');
    expect(getResults()).toEqual(['a/1']);

    await set('a/2');
    expect(getResults()).toEqual(['a/2']);
});

test('listen works 2', async ({set, listen}) => {

    const getResults = listen('a/1 b/*');
    await set('a/1');
    expect(getResults()).toEqual([]);

    await set('a/1 b/1');
    expect(getResults()).toEqual(['a/1 b/1']);

    await set('b/1');
    expect(getResults()).toEqual([]);
});

test('listen works with increment', async ({set, listen}) => {
    await set('a/1');
    
    const getResults = listen('a/*');
    await set('a/(increment)');

    expect(getResults()).toEqual(['a/2']);

    await set('a/(increment)');
    await set('a/(increment)');
    await set('a/(increment)');
    expect(getResults()).toEqual(['a/3', 'a/4', 'a/5']);
});

test('listen works with multi increment', async ({set, listen}) => {
    await set('item/a value/1');
    await set('item/b value/2');

    const getResultsA = listen('item/a value');
    const getResultsB = listen('item/b value');
    const getResultsAll = listen('item/* value');

    expect(getResultsA()).toEqual([]);
    expect(getResultsB()).toEqual([]);
    expect(getResultsAll()).toEqual([]);

    await set('item/* value/(increment)');

    expect(getResultsA()).toEqual(['item/a value/2']);
    expect(getResultsB()).toEqual(['item/b value/3']);
    expect(getResultsAll()).toEqual(['item/a value/2', 'item/b value/3']);
});
