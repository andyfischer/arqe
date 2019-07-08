
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
    const commands = parseFile(`

set a text(
  this 
  is 
  the 
  text
  value)

set b c

`);

    expect(commands[0].stringify()).toEqual(`set a text(
  this 
  is 
  the 
  text
  value)`);
    expect(commands[1].stringify()).toEqual('set b c');
});

it('parses a multiline command (pipes)', () => {

    const commands = parseFile(`
get a b
  | join c b/$b
  | join d c/$c

get b c
  `);

    expect(commands[0].stringify()).toEqual('get a b | join c b/$b | join d c/$c');
    expect(commands[1].stringify()).toEqual('get b c');
});
