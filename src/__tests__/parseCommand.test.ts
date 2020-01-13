
import parseCommand, { parsedCommandToString, appendTagInCommand } from '../parseCommand'

it('parses tags with no values', () => {
    const parsed = parseCommand('test a');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
    expect(parsed.tags[0].tagValue).toEqual(null)
});

it('parses tags with values', () => {
    const parsed = parseCommand('test a/1');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
    expect(parsed.tags[0].tagValue).toEqual('1')
});

it('parses negation', () => {
    const parsed = parseCommand('test !a');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
    expect(parsed.tags[0].negate).toEqual(true)
});

it('parses multiple tags', () => {
    const parsed = parseCommand('test a b c');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
    expect(parsed.tags[1].tagType).toEqual('b')
    expect(parsed.tags[2].tagType).toEqual('c')
});

it('parses tags with stars', () => {
    const parsed = parseCommand('test a/*');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
    expect(parsed.tags[0].starValue).toEqual(true)
});

it('parses tags with stars 2', () => {
    const parsed = parseCommand('test a/* c');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
    expect(parsed.tags[0].starValue).toEqual(true)
    expect(parsed.tags[1].tagType).toEqual('c')
});

it('ignores extra spaces', () => {
    const parsed = parseCommand('test   a');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
});

it('parses star', () => {
    const parsed = parseCommand('test *');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].star).toEqual(true)
});

it('parses question value', () => {
    const parsed = parseCommand('test type/?');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('type')
    expect(parsed.tags[0].questionValue).toEqual(true)
});

it('parses option syntax', () => {
    const parsed = parseCommand('test .foo');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('option')
    expect(parsed.tags[0].tagValue).toEqual('foo')
});

it('parses payload', () => {
    const parsed = parseCommand('test == 1');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags).toEqual([])
    expect(parsed.payloadStr).toEqual('1')
});

it('payload can have whitespace', () => {
    const parsed = parseCommand('test == 1 2 3');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags).toEqual([])
    expect(parsed.payloadStr).toEqual('1 2 3')
});

it('parses flags', () => {
    const parsed = parseCommand('test -a 1');
    expect(parsed.command).toEqual('test')
    expect(parsed.flags).toEqual({a: true})
    expect(parsed.tags[0].tagType).toEqual('1');
});

it('parses multiple flags', () => {
    const parsed = parseCommand('test -a -b -c 1');
    expect(parsed.command).toEqual('test')
    expect(parsed.flags).toEqual({a: true, b: true, c: true})
    expect(parsed.tags[0].tagType).toEqual('1');
});

it('parses multiple grouped flags', () => {
    const parsed = parseCommand('test -abc 1');
    expect(parsed.command).toEqual('test')
    expect(parsed.flags).toEqual({a: true, b: true, c: true})
    expect(parsed.tags[0].tagType).toEqual('1');
});

describe("parsedCommandToString", () => {
    it("works", () => {
        const parsed = parseCommand('get x y');
        expect(parsedCommandToString(parsed)).toEqual('get x y');
    });

    it("handles payloads", () => {
        const parsed = parseCommand('set x y == 123');
        expect(parsedCommandToString(parsed)).toEqual('set x y == 123');
    });
});

describe("appendTagInCommand", () => {
    expect(appendTagInCommand('get x y', 'extra')).toEqual('get x y extra');
    expect(appendTagInCommand('set x y == 1', 'extra')).toEqual('set x y extra == 1');
});
