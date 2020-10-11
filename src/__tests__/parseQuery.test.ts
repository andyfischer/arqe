
import { parseQuery } from '../stringFormat/parseQuery'

it(`parses a simple 'get'`, () => {
    const program = parseQuery('get a');
    expect(program.outputFrom).toBeTruthy();
});

it(`parses a custom command`, () => {
    const program = parseQuery('join-room room1');
    expect(program.outputFrom).toBeTruthy();
});

it(`doesn't trip up on an extra newline`, () => {
    const program = parseQuery('get 1\n');
    expect(program.outputFrom).toBeTruthy();
});
