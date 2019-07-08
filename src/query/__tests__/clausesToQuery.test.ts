
it('..', () => {
});

/*
import { parseQuery } from '..'
import clausesToQuery from '../clausesToQuery'

class ParseContext {
    isRelation(s: string) {
        return s.startsWith('rel')
    }

    isCommand(s: string) {
        return s.startsWith('command')
    }

    getLastIncompleteClause() {
        return null;
    }
}

it('parses <command> ...', () => {
    const query = clausesToQuery(new ParseContext(), [{ key: 'command' }, { key: 'etc' }])
    expect(query.command).toEqual('command');
    expect(query.relation).toBeFalsy();
});

it('parses <thing> <relation> <thing>', () => {
    const query = clausesToQuery(new ParseContext(), [{ key: 'thing' }, { key: 'rel' }, { key: 'thing' }])
    expect(query.command).toBeFalsy();
    expect(query.relation).toEqual('rel');
});

it('parses <incomplete> <relation> <thing>', () => {
    const context = new ParseContext();
    const prev = parseQuery('something', context);
    context['getLastIncompleteClause'] = () => prev
    const query = clausesToQuery(context, [{ key: 'rel' }, { key: 'thing' }])
    expect(query.clauses).toEqual([{
        key: 'something'
    },{
        key: 'rel',
        isRelation: true
    },{
        key: 'thing'
    }
    ]);
    expect(query.command).toBeFalsy();
    expect(query.relation).toEqual('rel');
});
*/
