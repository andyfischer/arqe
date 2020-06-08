
import parseCommand, { parseCommandChain } from '../parseCommand'
import { parsedCommandToString, appendTagInCommand } from '../stringifyQuery'
import Pattern from '../Pattern'
import { newTagFromObject } from '../PatternTag'
import { tagsToPattern } from '../Tuple'

it('parses tags with no values', () => {
    const parsed = parseCommand('test a');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('a')
    expect(parsed.pattern.tags[0].tagValue).toEqual(null)
});

it('parses tags with values', () => {
    const parsed = parseCommand('test a/1');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('a')
    expect(parsed.pattern.tags[0].tagValue).toEqual('1')
});

it('parses negation', () => {
    const parsed = parseCommand('test !a');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('a')
    expect(parsed.pattern.tags[0].negate).toEqual(true)
});

it('parses multiple tags', () => {
    const parsed = parseCommand('test a b c');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('a')
    expect(parsed.pattern.tags[1].attr).toEqual('b')
    expect(parsed.pattern.tags[2].attr).toEqual('c')
});

it('parses tag types with dashes', () => {
    const parsed = parseCommand('test tag-type');
    expect(parsed.pattern.tags[0].attr).toEqual('tag-type');
    const parsed2 = parseCommand('test tag-type/123');
    expect(parsed2.pattern.tags[0].attr).toEqual('tag-type');
    expect(parsed2.pattern.tags[0].tagValue).toEqual('123');
});

it('parses tags with stars', () => {
    const parsed = parseCommand('test a/*');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('a')
    expect(parsed.pattern.tags[0].starValue).toEqual(true)
});

it('parses tags with stars 2', () => {
    const parsed = parseCommand('test a/* c');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('a')
    expect(parsed.pattern.tags[0].starValue).toEqual(true)
    expect(parsed.pattern.tags[1].attr).toEqual('c')
});

it('ignores extra spaces', () => {
    const parsed = parseCommand('test   a');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('a')
});

it('parses star', () => {
    const parsed = parseCommand('test *');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].star).toEqual(true)
});

it('parses doubleStar', () => {
    const parsed = parseCommand('test **');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].doubleStar).toEqual(true)
});

it('parses option syntax', () => {
    const parsed = parseCommand('test .foo');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('option')
    expect(parsed.pattern.tags[0].tagValue).toEqual('foo')
});


it('parses flags', () => {
    const parsed = parseCommand('test -a 1');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.flags).toEqual({a: true})
    expect(parsed.pattern.tags[0].attr).toEqual('1');
});

it('parses multiple flags', () => {
    const parsed = parseCommand('test -a -b -c 1');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.flags).toEqual({a: true, b: true, c: true})
    expect(parsed.pattern.tags[0].attr).toEqual('1');
});

it('parses multicharacter flag', () => {
    const parsed = parseCommand('test -list 1');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.flags.list).toEqual(true);
    expect(parsed.pattern.tags[0].attr).toEqual('1');
});

it('parses unbound variables', () => {
    const parsed = parseCommand('test $a');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toBeFalsy();
    expect(parsed.pattern.tags[0].identifier).toEqual('a');
    expect(parsed.pattern.tags[0].star).toEqual(true);
});

it('parses unbound variables 2', () => {
    const parsed = parseCommand('test tagtype/$a');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('tagtype');
    expect(parsed.pattern.tags[0].identifier).toEqual('a');
    expect(parsed.pattern.tags[0].star).toBeFalsy();
    expect(parsed.pattern.tags[0].starValue).toEqual(true);
});

xit('parses quoted tag values', () => {
    const parsed = parseCommand('test tagtype/"string value"');
    expect(parsed.commandName).toEqual('test')
    expect(parsed.pattern.tags[0].attr).toEqual('tagtype');
    expect(parsed.pattern.tags[0].tagValue).toEqual('string value');
});

function testRestringify(str: string) {
    const restringified = parsedCommandToString(parseCommand(str))
    expect(restringified).toEqual(str);
}

describe("parsedCommandToString", () => {
    it("works", () => {
        const parsed = parseCommand('get x y');
        expect(parsedCommandToString(parsed)).toEqual('get x y');
    });
});

describe("appendTagInCommand", () => {
    it("works", () => {
        expect(appendTagInCommand('get x y', 'extra')).toEqual('get x y extra');
    });
});

it("restringify tests", () => {
    testRestringify("set *");
    testRestringify("set **");
    testRestringify("join $a")
    testRestringify("join $a $b")
    testRestringify("join a/$a $b")
});

it('stringifies tag identifiers', () => {
    expect((tagsToPattern([newTagFromObject({identifier: 'foo', star: true})])).stringify()).toEqual('$foo');
    expect((tagsToPattern([newTagFromObject({identifier: 'foo', attr: 'type', starValue: true})])).stringify()).toEqual('type/$foo');
    expect((tagsToPattern([newTagFromObject({identifier: 'foo', attr: 'type'})])).stringify()).toEqual('[from $foo] type');
    expect((tagsToPattern([newTagFromObject({identifier: 'foo', attr: 'type', tagValue: 'value'})])).stringify()).toEqual('[from $foo] type/value');
});

it('handles paren sections', () => {
    testRestringify('get tag(string value)');
    testRestringify(`get message(can't use dir(*))`);
    testRestringify(`git branch(* branch_name)`);
});

it('stringifies expressions', () => {
    testRestringify('set a/(increment)');
});

it('handles multiline commands', () => {
    const longCommand = 
`get javascript-ast text(
  function test() {
     const a = 1 + 2;
  }
)`
    ;

    testRestringify(longCommand);

    const chain = parseCommandChain(longCommand);
    expect(chain.commands.length == 1);
    expect(chain.commands[0].pattern.tags[1].tagValue).toEqual(`
  function test() {
     const a = 1 + 2;
  }
`);
});
