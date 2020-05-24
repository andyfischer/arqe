
import { parseFile } from '../parseCommand'

it('parses a list of commands', () => {
    const commands = parseFile(`

set a b
set c d(ef g)

set hi/jkl
`);
    expect(commands[0].stringify()).toEqual('set a b');
    expect(commands[1].stringify()).toEqual('set c d(ef g)');
    expect(commands[2].stringify()).toEqual('set hi/jkl');
});

it('parses a multiline command (paren argument)', () => {
});

it('parses a multiline command (pipes)', () => {
});
