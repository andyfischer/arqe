

import Scope from '../Scope'

it('handles none found', () => {
    const scope = new Scope();
    expect(scope.search('a/1 b/*')).toEqual({});
});

it('handles one found', () => {
    const scope = new Scope();
    scope.insert('a/1 b/2', 'the value');
    expect(scope.search('a/1 b/*')).toEqual({
        '2': 'the value'
    });
});

it('handles two found', () => {
    const scope = new Scope();
    scope.insert('a/1 b/2', 'the value');
    scope.insert('a/1 b/3', 'the other value');
    expect(scope.search('a/1 b/*')).toEqual({
        '2': 'the value',
        '3': 'the other value'
    });
});

it("doesn't give results for wrong starTag", () => {
    const scope = new Scope();
    scope.insert('a/1 b/2', 'the value');
    scope.insert('a/1 b/3', 'the other value');
    expect(scope.search('a/1 c/*')).toEqual({});
});

it("doesn't give results for triples", () => {
    const scope = new Scope();
    scope.insert('a/1 b/2 c/3', 'the value');
    expect(scope.search('a/1 b/*')).toEqual({});
    expect(scope.search('a/1 c/*')).toEqual({});
});

it("doesn't give results for singles", () => {
    const scope = new Scope();
    scope.insert('a/1', 'the value');
    expect(scope.search('a/1 b/*')).toEqual({});
});
