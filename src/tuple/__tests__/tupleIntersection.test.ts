import parseTuple from "../../parseTuple";
import tupleIntersection from "../tupleIntersection";

function testTupleIntersection(lhsStr: string, rhsStr: string) {
    const lhs = parseTuple(lhsStr);
    const rhs = parseTuple(rhsStr);

    return tupleIntersection(lhs, rhs).stringify();
}

it('works for simple cases', () => {
    expect(testTupleIntersection('a', 'a')).toEqual('a')
    expect(testTupleIntersection('a', 'b')).toEqual('')
    expect(testTupleIntersection('a b', 'b a')).toEqual('a b')

    expect(testTupleIntersection('a/1 b', 'a b')).toEqual('a/1 b')
    expect(testTupleIntersection('a b', 'a/1 b')).toEqual('a/1 b')
    expect(testTupleIntersection('a/1 b', 'a/1 b')).toEqual('a/1 b')
})