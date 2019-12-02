
import parseCommand from '../parseCommand'

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

it('parses subtraction tags', () => {
    const parsed = parseCommand('test -a');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].tagType).toEqual('a')
    expect(parsed.tags[0].subtract).toEqual(true)
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

it('parses star type', () => {
    const parsed = parseCommand('test *');
    expect(parsed.command).toEqual('test')
    expect(parsed.tags[0].starType).toEqual(true)
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
