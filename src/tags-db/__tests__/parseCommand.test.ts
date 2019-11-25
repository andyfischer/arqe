
import parseCommand from '../parseCommand'

it('parses tags with no values', () => {
    const parsed = parseCommand('test a');
    expect(parsed.command).toEqual('test')
    expect(parsed.args[0].tagType).toEqual('a')
    expect(parsed.args[0].tagValue).toEqual(null)
});

it('parses tags with values', () => {
    const parsed = parseCommand('test a/1');
    expect(parsed.command).toEqual('test')
    expect(parsed.args[0].tagType).toEqual('a')
    expect(parsed.args[0].tagValue).toEqual('1')
});

it('parses subtraction tags', () => {
    const parsed = parseCommand('test -a');
    expect(parsed.command).toEqual('test')
    expect(parsed.args[0].tagType).toEqual('a')
    expect(parsed.args[0].subtract).toEqual(true)
});
