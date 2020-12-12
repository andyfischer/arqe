
import parseCommand from '../parseCommand'
import { appendTagInCommand } from '../stringifyQuery'
import { newTagFromObject } from '../TupleTag'
import { newTuple } from '../Tuple'

it('parses tags with no values', () => {
    const parsed = parseCommand('test a');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('a')
    expect(parsed.tuple.tags[0].value).toEqual(null)
});

it('parses tags with values', () => {
    const parsed = parseCommand('test a/1');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('a')
    expect(parsed.tuple.tags[0].value).toEqual('1')
});

it('parses multiple tags', () => {
    const parsed = parseCommand('test a b c');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('a')
    expect(parsed.tuple.tags[1].attr).toEqual('b')
    expect(parsed.tuple.tags[2].attr).toEqual('c')
});

it('parses tag types with dashes', () => {
    const parsed = parseCommand('test tag-type');
    expect(parsed.tuple.tags[0].attr).toEqual('tag-type');
    const parsed2 = parseCommand('test tag-type/123');
    expect(parsed2.tuple.tags[0].attr).toEqual('tag-type');
    expect(parsed2.tuple.tags[0].value).toEqual('123');
});

it('parses tags with stars', () => {
    const parsed = parseCommand('test a/*');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('a')
    expect(parsed.tuple.tags[0].starValue).toEqual(true)
});

it('parses tags with stars 2', () => {
    const parsed = parseCommand('test a/* c');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('a')
    expect(parsed.tuple.tags[0].starValue).toEqual(true)
    expect(parsed.tuple.tags[1].attr).toEqual('c')
});

it('ignores extra spaces', () => {
    const parsed = parseCommand('test   a');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('a')
});

it('parses star', () => {
    const parsed = parseCommand('test *');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].star).toEqual(true)
});

it('parses doubleStar', () => {
    const parsed = parseCommand('test **');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].doubleStar).toEqual(true)
});

it('parses unbound variables', () => {
    const parsed = parseCommand('test $a');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toBeFalsy();
    expect(parsed.tuple.tags[0].identifier).toEqual('a');
    expect(parsed.tuple.tags[0].star).toEqual(true);
});

it('parses unbound variables 2', () => {
    const parsed = parseCommand('test tagtype/$a');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('tagtype');
    expect(parsed.tuple.tags[0].identifier).toEqual('a');
    expect(parsed.tuple.tags[0].star).toBeFalsy();
});

xit('parses quoted tag values', () => {
    const parsed = parseCommand('test tagtype/"string value"');
    expect(parsed.verb).toEqual('test')
    expect(parsed.tuple.tags[0].attr).toEqual('tagtype');
    expect(parsed.tuple.tags[0].value).toEqual('string value');
});

function testRestringify(str: string) {
    const restringified = parseCommand(str).stringify();
    expect(restringified).toEqual(str);
}

describe("Command.stringify", () => {
    it("works", () => {
        const parsed = parseCommand('get x y');
        expect(parsed.stringify()).toEqual('get x y');
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
    expect((newTuple([newTagFromObject({identifier: 'foo', star: true})])).stringify()).toEqual('$foo');
    expect((newTuple([newTagFromObject({identifier: 'foo', attr: 'type'})])).stringify()).toEqual('type/$foo');
    expect((newTuple([newTagFromObject({identifier: 'foo', attr: 'type', value: 'value'})])).stringify()).toEqual('[from $foo] type/value');
});

it('stringifies expressions', () => {
    testRestringify('set a/(increment)');
});

