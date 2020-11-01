
import { toQuery } from '../coerce'
import { isQuery } from '../Query'

it('toQuery works on strings', () => {
    const query = toQuery('get a b');
    expect(isQuery(query)).toBe(true);
    expect(query.stringify()).toEqual('get a b');
});

it('toQuery is idempotent', () => {
    const query = toQuery(toQuery('get a b'));
    expect(query.stringify()).toEqual('get a b');
});

it('toQuery works on lists', () => {
    const query = toQuery([{
        verb: 'get',
        a: '1',
        b: '2',
    }]);

    expect(query.stringify()).toEqual('get a/1 b/2');

    const query2 = toQuery([{
        verb: 'get',
        a: '1',
        b: '2',
    },{
        verb: 'join',
        b: '2',
        c: '3',
    }]);

    expect(query2.stringify()).toEqual('get a/1 b/2 | join b/2 c/3');
});
