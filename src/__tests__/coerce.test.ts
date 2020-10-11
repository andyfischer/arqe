
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
