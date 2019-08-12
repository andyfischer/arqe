
import { parseQuery } from '..'
import { Snapshot } from '../..'

let snapshot = {
    isRelation(s) {
        return s === 'relation';
    },
    isCommand(s) {
        return s === 'command';
    }
} as Snapshot;

it('parses commands as commands', () => {
    const query = parseQuery('command', snapshot);

    expect(query.command).toEqual('command');
    expect(query.type).toEqual('command');
    expect(query.args).toEqual([]);
});

it('parses command args', () => {
    const query = parseQuery('command 1 2 3', snapshot);

    expect(query.command).toEqual('command');
    expect(query.type).toEqual('command');
    expect(query.args).toEqual(['1', '2', '3']);
});

it('parses <thing> <relation>', () => {
    const query = parseQuery('thing relation', snapshot);

    expect(query.type).toEqual('relation');
    expect(query.relation).toEqual('relation');
    expect(query.relationSubject).toEqual('thing');
    expect(query.args).toEqual([]);
});

it('parses <thing> <relation> <thing2>', () => {
    const query = parseQuery('thing relation thing2', snapshot);

    expect(query.type).toEqual('relation');
    expect(query.relation).toEqual('relation');
    expect(query.relationSubject).toEqual('thing');
    expect(query.args).toEqual(['thing2']);
});

it('parses <relation> <thing1> <thing2> <thing3>', () => {
    const query = parseQuery('relation thing1 thing2 thing3', snapshot);

    expect(query.type).toEqual('relation');
    expect(query.relation).toEqual('relation');
    expect(query.relationSubject).toEqual('thing1');
    expect(query.args).toEqual(['thing2', 'thing3']);
});
