
import PatternTag from '../TupleTag'
import parseTuple from '../parseTuple';

it('PatternTag.setValue works', () => {
    const tag = new PatternTag({ attr: 'a', tagValue: '1' });
    expect(tag.stringify()).toEqual('a/1');

    const tag2 = tag.setValue('3');
    expect(tag2.stringify()).toEqual('a/3');
});

it('updateTagAtIndex works', () => {
    let p = parseTuple('a/1 b/2');
    expect(p.stringify()).toEqual('a/1 b/2');
    p = p.updateTagAtIndex(0, tag => tag.setValue('3'));
    expect(p.stringify()).toEqual('a/3 b/2');
});

it('updateTagOfType works', () => {
    let p = parseTuple('a/1 b/2');
    expect(p.stringify()).toEqual('a/1 b/2');
    p = p.updateTagOfType('b', tag => tag.setValue('3'));
    expect(p.stringify()).toEqual('a/1 b/3');
});

describe('isSupersetOf', () => {

    function test(superPattern: string, subPattern: string) {
        return parseTuple(superPattern).isSupersetOf(
            parseTuple(subPattern));
    }

    it('works', () => {
        expect(test('x/1 y/1', 'x/1 y/1')).toEqual(true);
        expect(test('x/1 y/1', 'x/1')).toEqual(false);
        expect(test('x/1 ', 'x/1 y/1')).toEqual(false);
        expect(test('x/1 y/*', 'x/1 y/1')).toEqual(true);
        expect(test('x/1 y/1', 'x/1 y/*')).toEqual(false);
        expect(test('x/* y/*', 'x/1 y/1')).toEqual(true);
        expect(test('x/* y/*', 'x/1 y/*')).toEqual(true);
        expect(test('x/* y/*', 'x/* y/*')).toEqual(true);
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
    });

    xit('works with duplicated types', () => {
        expect(test('x/1 x/2', 'x/1 x/2')).toEqual(true);
        expect(test('x/1 x/2', 'x/2 x/1')).toEqual(true);
        expect(test('x/1 x/*', 'x/2 x/1')).toEqual(true);
        expect(test('x/2 x/*', 'x/2 x/1')).toEqual(true);
        expect(test('x/2 x/1', 'x/* x/1')).toEqual(false);
        expect(test('x/2 x/1', 'x/2 x/2')).toEqual(false);
    });
});
