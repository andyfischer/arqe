"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = require("../parseCommand");
const PatternTag_1 = __importDefault(require("../PatternTag"));
it('PatternTag.setValue works', () => {
    const tag = new PatternTag_1.default();
    tag.tagType = 'a';
    tag.tagValue = '1';
    expect(tag.stringify()).toEqual('a/1');
    const tag2 = tag.setValue('3');
    expect(tag2.stringify()).toEqual('a/3');
});
it('updateTagAtIndex works', () => {
    let p = parseCommand_1.parsePattern('a/1 b/2');
    expect(p.stringify()).toEqual('a/1 b/2');
    p = p.updateTagAtIndex(0, tag => tag.setValue('3'));
    expect(p.stringify()).toEqual('a/3 b/2');
});
it('updateTagOfType works', () => {
    let p = parseCommand_1.parsePattern('a/1 b/2');
    expect(p.stringify()).toEqual('a/1 b/2');
    p = p.updateTagOfType('b', tag => tag.setValue('3'));
    expect(p.stringify()).toEqual('a/1 b/3');
});
describe('isSupersetOf', () => {
    function test(superPattern, subPattern) {
        return parseCommand_1.parsePattern(superPattern).isSupersetOf(parseCommand_1.parsePattern(subPattern));
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
        const p = parseCommand_1.parsePattern(pattern);
        const rel = parseCommand_1.parsePattern(relation);
        return p.matches(rel);
    }
    it('works', () => {
        expect(test('x/1', 'x/1')).toEqual(true);
        expect(test('x/*', 'x/1')).toEqual(true);
        expect(test('*', 'x/1')).toEqual(true);
        expect(test('x/2', 'x/1')).toEqual(false);
        expect(test('x', 'x/1')).toEqual(true);
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
        expect(test('x/* **', 'x/1')).toEqual(true);
        expect(test('x/* **', 'y/1')).toEqual(false);
    });
});
//# sourceMappingURL=Pattern.test.js.map