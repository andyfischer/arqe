
import parseSyntax from '../parseSyntax'

it('parses a list of identifiers', () => {
    const syntax = parseSyntax('def-command mycommand');
    expect(syntax.clauses).toEqual([{
        key: 'def-command'
    },{
        key: 'mycommand'
    }]);
});

it('parses key=value pairs', () => {
    const syntax = parseSyntax('do-something tag key1=value1');
    expect(syntax.clauses).toEqual([{
        key: 'do-something'
    },{
        key: 'tag'
    },{
        key: 'key1',
        assignVal: 'value1'
    }]);
});

it('parses base64 as a value (even when it has a =)', () => {
    const syntax = parseSyntax('do-something tag key1=abc=');
    expect(syntax.clauses).toEqual([{
        key: 'do-something'
    },{
        key: 'tag'
    },{
        key: 'key1',
        assignVal: 'abc='
    }]);
});

it('handles quotes', () => {
    const syntax = parseSyntax('do-something "quoted string"');
    expect(syntax.clauses).toEqual([{
        key: 'do-something'
    },{
        key: 'quoted string'
    }]);
});
