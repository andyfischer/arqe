
import Scope from '../Scope'

it('supports insertion and lookup', () => {
    const scope = new Scope();
    scope.insert({ a: '1', b: '2'}, 'the value');
    expect(scope.find({ a: '1', b: '2'})).toEqual('the value');
});

it('supports deletion', () => {
    const scope = new Scope();
    scope.insert({ a: '1', b: '2'}, 'the value');
    expect(scope.find({ a: '1', b: '2'})).toEqual('the value');
    scope.deleteRelation({ a: '1', b: '2'});
    expect(scope.findOptional({ a: '1', b: '2'}, null)).toEqual(null);
});

describe('findPairsWithKey', () => {
    it('handles none found', () => {
        const scope = new Scope();
        expect(scope.findPairsWithKey('a', '1', 'b')).toEqual({});
    });

    it('handles one found', () => {
        const scope = new Scope();
        scope.insert({a: '1', b: '2'}, 'the value');
        expect(scope.findPairsWithKey('a', '1', 'b')).toEqual({
            '2': 'the value'
        });
    });

    it('handles two found', () => {
        const scope = new Scope();
        scope.insert({a: '1', b: '2'}, 'the value');
        scope.insert({a: '1', b: '3'}, 'the other value');
        expect(scope.findPairsWithKey('a', '1', 'b')).toEqual({
            '2': 'the value',
            '3': 'the other value'
        });
    });

    it("doesn't give results for wrong starTag", () => {
        const scope = new Scope();
        scope.insert({a: '1', b: '2'}, 'the value');
        scope.insert({a: '1', b: '3'}, 'the other value');
        expect(scope.findPairsWithKey('a', '1', 'c')).toEqual({});
    });

    it("doesn't give results for triples", () => {
        const scope = new Scope();
        scope.insert({a: '1', b: '2', c: '3'}, 'the value');
        expect(scope.findPairsWithKey('a', '1', 'b')).toEqual({});
        expect(scope.findPairsWithKey('a', '1', 'c')).toEqual({});
    });

    it("doesn't give results for singles", () => {
        const scope = new Scope();
        scope.insert({a: '1'}, 'the value');
        expect(scope.findPairsWithKey('a', '1', 'b')).toEqual({});
    });
});
