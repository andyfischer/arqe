import parseTuple from "../parseTuple";
import { Tuple } from "..";


function propCheck(lhs: Tuple, rhs: Tuple) {
    if (lhs.hasOverlap(rhs) !== rhs.hasOverlap(lhs)) {
        throw new Error(`hasOverlap wasn't reflexive for (${lhs.stringify()}) and (${rhs.stringify()}) \n`
        +`X.hasOverlap(Y) === ${lhs.hasOverlap(rhs)} \n`
        +`Y.hasOverlap(X) === ${rhs.hasOverlap(lhs)}`
        )
    }
}

function hasOverlap(lhsStr: string, rhsStr: string) {
    const lhs = parseTuple(lhsStr);
    const rhs = parseTuple(rhsStr);

    propCheck(lhs, rhs);

    return lhs.hasOverlap(rhs);
}

it('matches tuples with same attrs', () => {
    expect(hasOverlap('a', 'a')).toEqual(true);
    expect(hasOverlap('a b', 'a b')).toEqual(true);
    expect(hasOverlap('a b', 'b a')).toEqual(true);
    expect(hasOverlap('a', 'a/1')).toEqual(true);
    expect(hasOverlap('a b', 'a b/1')).toEqual(true);
})

it('rejects tuples with different attrs', () => {
    expect(hasOverlap('a', 'a b')).toEqual(false);
    expect(hasOverlap('a b c', 'a')).toEqual(false);
})

it('matches tuples with equal definite values', () => {
    expect(hasOverlap('a/1', 'a/1')).toEqual(true);
    expect(hasOverlap('a b/1', 'a b/1')).toEqual(true);
    expect(hasOverlap('a/5 b/1', 'a/5 b/1')).toEqual(true);
})

it('rejects tuples with unequal definite values', () => {
    expect(hasOverlap('a/1', 'a/2')).toEqual(false);
    expect(hasOverlap('a b/1', 'a b/2')).toEqual(false);
    expect(hasOverlap('a/5 b/1', 'a/3 b/1')).toEqual(false);
})

it('handles tuples with double star', () => {
    expect(hasOverlap('a **', 'a b')).toEqual(true);
    expect(hasOverlap('a b **', 'a b')).toEqual(true);
    expect(hasOverlap('a b **', 'a')).toEqual(false);
    expect(hasOverlap('a b **', 'a **')).toEqual(true);
    expect(hasOverlap('a/1 b **', 'a **')).toEqual(true);
    expect(hasOverlap('a/1 b **', 'a/2 **')).toEqual(false);
})

it('handles tuples with ?', () => {
    expect(hasOverlap('a b', 'a b?')).toEqual(true);
    expect(hasOverlap('a', 'a b?')).toEqual(true);
    expect(hasOverlap('a c', 'a b?')).toEqual(false);
});