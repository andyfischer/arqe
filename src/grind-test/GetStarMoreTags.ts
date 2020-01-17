
import { startSuite } from './TestSuite'
const { test } = startSuite();

test('get * works with fixed valueless tags', ({run}) => {
    run('set a/1 b c')
    expect(run('get a/* b')).toEqual([]);
    expect(run('get a/* b c')).toEqual(['a/1']);
    expect(run('get a/* b c d')).toEqual([]);
});

test('get * works with fixed valueless tags 2', ({run}) => {
    run('set a/1 b c')
    run('set a/2 b c')
    expect(run('get a/* b c')).toEqual(['a/1', 'a/2']);
});

test('get * works with fixed valueless tags 3', ({run}) => {
    expect(run('set a/1 b c')).toEqual('#done');
    expect(run('set a/2 b c')).toEqual('#done');
    expect(run('get a/* b c')).toEqual(['a/1', 'a/2']);

    run('set a/1 b/1')
    run('set a/2 b/1')
    run('set a/3 b/2')
    expect(run('get a/* b/1')).toEqual(['a/1', 'a/2'])
});

test('get * works with fixed value tag', ({run}) => {
    expect(run('set a/1 b c')).toEqual('#done');
    expect(run('set a/2 b c')).toEqual('#done');
    expect(run('get a/* b c')).toEqual(['a/1', 'a/2']);

    run('set a/1 b/1')
    run('set a/2 b/1')
    run('set a/3 b/2')
    expect(run('get a/* b/1')).toEqual(['a/1', 'a/2'])
});

test('get * works with fixed value tag 2', ({run}) => {
    run('set a/1 b/1')
    run('set a/2 b/1')
    run('set a/3 b/2')
    expect(run('get a/* b/2')).toEqual(['a/3']);
});

test('get * works with fixed value tag 3', ({run}) => {
    run('set a/1 b')
    run('set a/2 b')
    run('set a/3 c')
    expect(run('get a/* b')).toEqual(['a/1', 'a/2'])
    expect(run('get a/* c')).toEqual(['a/3'])
});
