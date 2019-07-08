
it('', () => {
});

/*
import stringToClauses from '../stringToClauses'

it('parses a list of identifiers', () => {
    const clauses = stringToClauses('def-command mycommand');
    expect(clauses).toEqual([{
        key: 'def-command'
    },{
        key: 'mycommand'
    }]);
});

it('parses key=value pairs', () => {
    const clauses = stringToClauses('do-something tag key1=value1');
    expect(clauses).toEqual([{
        key: 'do-something'
    },{
        key: 'tag'
    },{
        key: 'key1',
        assignVal: 'value1'
    }]);
});

it('parses base64 as a value (even when it has a =)', () => {
    const clauses = stringToClauses('do-something tag key1=abc=');
    expect(clauses).toEqual([{
        key: 'do-something'
    },{
        key: 'tag'
    },{
        key: 'key1',
        assignVal: 'abc='
    }]);
});
*/
