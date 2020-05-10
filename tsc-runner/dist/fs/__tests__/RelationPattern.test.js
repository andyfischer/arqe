"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationPattern_1 = require("../RelationPattern");
describe('isSupersetOf', () => {
    function test(superPattern, subPattern) {
        return RelationPattern_1.parsePattern(superPattern).isSupersetOf(RelationPattern_1.parsePattern(subPattern));
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
    function test(pattern, relation) {
        const p = RelationPattern_1.parsePattern(pattern);
        const rel = RelationPattern_1.parsePattern(relation);
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
        expect(test('* tag-definition provider/wssync', 'wstest tag-definition provider/wssync')).toEqual(true);
    });
    it('double star works', () => {
        expect(test('x **', 'x y')).toEqual(true);
        expect(test('x **', 'x y z')).toEqual(true);
        expect(test('x **', 'z')).toEqual(false);
    });
});
describe('freeze', () => {
    it('blocks setValue', () => {
        const pattern = RelationPattern_1.parsePattern('1 2 3');
        pattern.setValue(1);
        pattern.freeze();
        expect(() => { pattern.setValue(2); }).toThrow();
    });
    it('freezes the tags list', () => {
        const pattern = RelationPattern_1.parsePattern('1 2 3');
        expect(() => { pattern.tags.push({}); }).not.toThrow();
        expect(() => { pattern.tags[0].tagType = 'x'; }).not.toThrow();
        pattern.freeze();
        expect(() => { pattern.tags.push({}); }).toThrow();
        expect(() => { pattern.tags[0].tagType = 'x'; }).toThrow();
    });
});
describe('copy', () => {
    it('creates a copy', () => {
        const pattern = RelationPattern_1.parsePattern('1 2 3');
        const copy = pattern.copy();
        expect(copy.stringify()).toEqual('1 2 3');
    });
    it("doesn't share the tags object", () => {
        const original = RelationPattern_1.parsePattern('1 2 3');
        original.freeze();
        const copy = original.copy();
        copy.tags[0].tagType = '4';
        expect(original.stringify()).toEqual('1 2 3');
        expect(copy.stringify()).toEqual('4 2 3');
    });
});
//# sourceMappingURL=RelationPattern.test.js.map