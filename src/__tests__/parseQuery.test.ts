
import { parseQuery } from '../stringFormat/parseQuery'

it(`parses a simple 'get'`, () => {
    const query = parseQuery('get a');
    expect(query.stringify()).toEqual('[Relation (a verb/get query-term-id/1) ]');
});

it(`parses a custom command`, () => {
    const query = parseQuery('join-room room1');
    expect(query.stringify()).toEqual('[Relation (room1 verb/join-room query-term-id/1) ]');
});

it(`doesn't trip up on an extra newline`, () => {
    const query = parseQuery('get 1\n');
    expect(query.stringify()).toEqual('[Relation (1 verb/get query-term-id/1) ]');
});

