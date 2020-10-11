
import parseTuple from '../stringFormat/parseTuple';

function test(superPattern: string, subPattern: string) {
    return parseTuple(superPattern).isSupersetOf(
        parseTuple(subPattern));
}

it('handles basic cases', () => {
    expect(test('x/1 y/1', 'x/1 y/1')).toEqual(true);
    expect(test('x/1 y/1', 'x/1')).toEqual(false);
    expect(test('x/1 ', 'x/1 y/1')).toEqual(false);
    expect(test('x/1 y', 'x/1 y/1')).toEqual(true);
    expect(test('x/1 y/1', 'x/1 y/*')).toEqual(false);
    expect(test('x y', 'x/1 y/1')).toEqual(true);
    expect(test('x y', 'x/1 y')).toEqual(true);
    expect(test('x y', 'x y')).toEqual(true);
    expect(test('**', 'x/* y/*')).toEqual(true);

    expect(test('x/1', 'x/1')).toEqual(true);
    expect(test('x/*', 'x/1')).toEqual(true);
    expect(test('*', 'x/1')).toEqual(true);
    expect(test('x/2', 'x/1')).toEqual(false);
    expect(test('x', 'x/1')).toEqual(true);
    expect(test('y/1', 'x/1')).toEqual(false);
    expect(test('', 'x/1')).toEqual(false);
    expect(test('x/1', '')).toEqual(false);
});

it('double star works', () => {
    expect(test('x **', 'x y')).toEqual(true);
    expect(test('x **', 'x y z')).toEqual(true);
    expect(test('x **', 'z')).toEqual(false);

    expect(test('x/* **', 'x/1')).toEqual(true);
    expect(test('x/* **', 'y/1')).toEqual(false);

    expect(test('**', 'a $x val/*')).toEqual(true);
});
