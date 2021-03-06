
import { isTuple } from '../Tuple'
import { toTuple, toQuery } from '../coerce'
import { isQuery } from '../Query'

it('toTuple works when receiving raw tags', () => {
    const original = toTuple('a[1] b[2]');
    const copy = toTuple([original.getTag('a')]);
    expect(copy.stringify()).toEqual('a/1');

    const subTuple = toTuple(['get', 'shell', 'stdout', original.getTag('a'), original.getTag('b')]);
});

it('toQuery works on strings', () => {
    const query = toQuery('get a b');
    expect(isQuery(query)).toBe(true);
    expect(query.stringify()).toEqual('[(get a b)]');
});

it('toQuery is idempotent', () => {
    const query = toQuery(toQuery('get a b'));
    expect(query.stringify()).toEqual('[(get a b)]');
});

it('toQuery works on lists', () => {
    const query = toQuery([{
        verb: 'get',
        a: '1',
        b: '2',
    }]);

    expect(query.stringify()).toEqual('[(verb/get a/1 b/2)]');

    const query2 = toQuery([{
        verb: 'get',
        a: '1',
        b: '2',
    },{
        verb: 'join',
        b: '2',
        c: '3',
    }]);

    expect(query2.stringify()).toEqual('[(verb/get a/1 b/2), (verb/join b/2 c/3)]');
});

it('toTuple handles native values', () => {
    const t = toTuple({
        number: 1,
        tuple: toTuple(['get a b'])
    });

    expect(t.stringify()).toEqual("number/1 tuple(get a b)");
});

it('toTuple treats null value as absent tag', () => {
    const t = toTuple({
        a: true,
        b: false,
        c: null
    });

    expect(t.stringify()).toEqual("a/true b/false");
});

it('isTuple works', () => {
    const t = toTuple({});

    expect(isTuple(t)).toEqual(true);
    expect(isTuple("hi")).toEqual(false);
    expect(isTuple(null)).toEqual(false);
});
