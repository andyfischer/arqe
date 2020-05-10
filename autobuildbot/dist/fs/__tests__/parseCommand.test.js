"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("../parseCommand"));
const stringifyQuery_1 = require("../stringifyQuery");
const Pattern_1 = __importDefault(require("../Pattern"));
const PatternTag_1 = require("../PatternTag");
it('parses tags with no values', () => {
    const parsed = parseCommand_1.default('test a');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('a');
    expect(parsed.pattern.tags[0].tagValue).toEqual(null);
});
it('parses tags with values', () => {
    const parsed = parseCommand_1.default('test a/1');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('a');
    expect(parsed.pattern.tags[0].tagValue).toEqual('1');
});
it('parses negation', () => {
    const parsed = parseCommand_1.default('test !a');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('a');
    expect(parsed.pattern.tags[0].negate).toEqual(true);
});
it('parses multiple tags', () => {
    const parsed = parseCommand_1.default('test a b c');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('a');
    expect(parsed.pattern.tags[1].tagType).toEqual('b');
    expect(parsed.pattern.tags[2].tagType).toEqual('c');
});
it('parses tag types with dashes', () => {
    const parsed = parseCommand_1.default('test tag-type');
    expect(parsed.pattern.tags[0].tagType).toEqual('tag-type');
    const parsed2 = parseCommand_1.default('test tag-type/123');
    expect(parsed2.pattern.tags[0].tagType).toEqual('tag-type');
    expect(parsed2.pattern.tags[0].tagValue).toEqual('123');
});
it('parses tags with stars', () => {
    const parsed = parseCommand_1.default('test a/*');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('a');
    expect(parsed.pattern.tags[0].starValue).toEqual(true);
});
it('parses tags with stars 2', () => {
    const parsed = parseCommand_1.default('test a/* c');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('a');
    expect(parsed.pattern.tags[0].starValue).toEqual(true);
    expect(parsed.pattern.tags[1].tagType).toEqual('c');
});
it('ignores extra spaces', () => {
    const parsed = parseCommand_1.default('test   a');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('a');
});
it('parses star', () => {
    const parsed = parseCommand_1.default('test *');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].star).toEqual(true);
});
it('parses doubleStar', () => {
    const parsed = parseCommand_1.default('test **');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].doubleStar).toEqual(true);
});
it('parses question value', () => {
    const parsed = parseCommand_1.default('test type/?');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('type');
    expect(parsed.pattern.tags[0].questionValue).toEqual(true);
});
it('parses option syntax', () => {
    const parsed = parseCommand_1.default('test .foo');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('option');
    expect(parsed.pattern.tags[0].tagValue).toEqual('foo');
});
it('parses flags', () => {
    const parsed = parseCommand_1.default('test -a 1');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.flags).toEqual({ a: true });
    expect(parsed.pattern.tags[0].tagType).toEqual('1');
});
it('parses multiple flags', () => {
    const parsed = parseCommand_1.default('test -a -b -c 1');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.flags).toEqual({ a: true, b: true, c: true });
    expect(parsed.pattern.tags[0].tagType).toEqual('1');
});
it('parses multicharacter flag', () => {
    const parsed = parseCommand_1.default('test -list 1');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.flags.list).toEqual(true);
    expect(parsed.pattern.tags[0].tagType).toEqual('1');
});
it('parses unbound variables', () => {
    const parsed = parseCommand_1.default('test $a');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toBeFalsy();
    expect(parsed.pattern.tags[0].identifier).toEqual('a');
    expect(parsed.pattern.tags[0].star).toEqual(true);
});
it('parses unbound variables 2', () => {
    const parsed = parseCommand_1.default('test tagtype/$a');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('tagtype');
    expect(parsed.pattern.tags[0].identifier).toEqual('a');
    expect(parsed.pattern.tags[0].star).toBeFalsy();
    expect(parsed.pattern.tags[0].starValue).toEqual(true);
});
xit('parses quoted tag values', () => {
    const parsed = parseCommand_1.default('test tagtype/"string value"');
    expect(parsed.commandName).toEqual('test');
    expect(parsed.pattern.tags[0].tagType).toEqual('tagtype');
    expect(parsed.pattern.tags[0].tagValue).toEqual('string value');
});
function testRestringify(str) {
    const restringified = stringifyQuery_1.parsedCommandToString(parseCommand_1.default(str));
    expect(restringified).toEqual(str);
}
describe("parsedCommandToString", () => {
    it("works", () => {
        const parsed = parseCommand_1.default('get x y');
        expect(stringifyQuery_1.parsedCommandToString(parsed)).toEqual('get x y');
    });
});
describe("appendTagInCommand", () => {
    it("works", () => {
        expect(stringifyQuery_1.appendTagInCommand('get x y', 'extra')).toEqual('get x y extra');
    });
});
it("restringify tests", () => {
    testRestringify("set *");
    testRestringify("set **");
    testRestringify("join $a");
    testRestringify("join $a $b");
    testRestringify("join a/$a $b");
});
it('stringifies tag identifiers', () => {
    expect((new Pattern_1.default([PatternTag_1.newTagFromObject({ identifier: 'foo', star: true })])).stringify()).toEqual('$foo');
    expect((new Pattern_1.default([PatternTag_1.newTagFromObject({ identifier: 'foo', tagType: 'type', starValue: true })])).stringify()).toEqual('type/$foo');
    expect((new Pattern_1.default([PatternTag_1.newTagFromObject({ identifier: 'foo', tagType: 'type' })])).stringify()).toEqual('[from $foo] type');
    expect((new Pattern_1.default([PatternTag_1.newTagFromObject({ identifier: 'foo', tagType: 'type', tagValue: 'value' })])).stringify()).toEqual('[from $foo] type/value');
});
it('handles paren sections', () => {
    testRestringify('get tag(string value)');
    testRestringify(`get message(can't use dir(*))`);
    testRestringify(`git branch(* branch_name)`);
});
it('stringifies expressions', () => {
    testRestringify('set a/(increment)');
});
//# sourceMappingURL=parseCommand.test.js.map