
import Schema from '../Schema'
import { commandToRelationPattern } from '../RelationPattern'

describe('patternWithoutType', () => {
    it('works', () => {
        const pattern = commandToRelationPattern("get a b/123 branch/1");
        expect(pattern.stringify()).toEqual("a b/123 branch/1");
        const pattern2 = pattern.patternWithoutType("branch");
        expect(pattern2.stringify()).toEqual("a b/123");
    });
});

describe('isSupersetOf', () => {

    function test(superPattern: string, subPattern: string) {
        return commandToRelationPattern(superPattern).isSupersetOf(
            commandToRelationPattern(subPattern));
    }

    it('works', () => {
        expect(test('g x/1 y/1', 'g x/1 y/1')).toEqual(true);
        expect(test('g x/1 y/1', 'g x/1')).toEqual(false);
        expect(test('g x/1 ', 'g x/1 y/1')).toEqual(false);
        expect(test('g x/1 y/*', 'g x/1 y/1')).toEqual(true);
        expect(test('g x/1 y/1', 'g x/1 y/*')).toEqual(false);
        expect(test('g x/* y/*', 'g x/1 y/1')).toEqual(true);
        expect(test('g x/* y/*', 'g x/1 y/*')).toEqual(true);
        expect(test('g x/* y/*', 'g x/* y/*')).toEqual(true);
        expect(test('g **', 'g x/* y/*')).toEqual(true);
    });

    it('works with duplicated types', () => {
        expect(test('g x/1 x/2', 'g x/1 x/2')).toEqual(true);
        expect(test('g x/1 x/2', 'g x/2 x/1')).toEqual(true);
        expect(test('g x/1 x/*', 'g x/2 x/1')).toEqual(true);
        expect(test('g x/2 x/*', 'g x/2 x/1')).toEqual(true);
        expect(test('g x/2 x/1', 'g x/* x/1')).toEqual(false);
        expect(test('g x/2 x/1', 'g x/2 x/2')).toEqual(false);
    });
});
