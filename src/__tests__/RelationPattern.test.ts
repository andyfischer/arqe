
import Schema from '../Schema'
import { parsePattern } from '../RelationPattern'

describe('isSupersetOf', () => {

    function test(superPattern: string, subPattern: string) {
        return parsePattern(superPattern).isSupersetOf(
            parsePattern(subPattern));
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
    });

    it('works with star types', () => {
        expect(test('*', 'x')).toEqual(true);
        expect(test('*', 'x y')).toEqual(false);
        expect(test('*', '')).toEqual(false);
    });

    it('works with duplicated types', () => {
        expect(test('x/1 x/2', 'x/1 x/2')).toEqual(true);
        expect(test('x/1 x/2', 'x/2 x/1')).toEqual(true);
        expect(test('x/1 x/*', 'x/2 x/1')).toEqual(true);
        expect(test('x/2 x/*', 'x/2 x/1')).toEqual(true);
        expect(test('x/2 x/1', 'x/* x/1')).toEqual(false);
        expect(test('x/2 x/1', 'x/2 x/2')).toEqual(false);
    });
});

describe("matches", () => {
    function test(pattern: string, relation: string) {
        const p = parsePattern(pattern);
        const rel = parsePattern(relation).toRelation();
        return p.matches(rel);
    }

    it('works', () => {
        expect(test('x/1', 'x/1')).toEqual(true);
        expect(test('x/*', 'x/1')).toEqual(true);
        expect(test('*', 'x/1')).toEqual(true);
        expect(test('x/2', 'x/1')).toEqual(false);
        expect(test('x', 'x/1')).toEqual(false);
        expect(test('y/1', 'x/1')).toEqual(false);
        expect(test('', 'x/1')).toEqual(false);
        expect(test('x/1', '')).toEqual(false);
    });

    it('star type works', () => {
        expect(test('x y *', 'x y z')).toEqual(true);
        expect(test('x y *', 'x y y')).toEqual(true);
        expect(test('x y *', 'x z z')).toEqual(false);
        expect(test('* tag-definition provider/wssync',
                    'wstest tag-definition provider/wssync')).toEqual(true);
    });
});
