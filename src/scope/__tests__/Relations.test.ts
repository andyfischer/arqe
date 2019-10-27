
import Scope from '../Scope'

it('supports insertion and lookup', () => {
    const scope = new Scope();
    scope.insert('a/1 b/2', 'the value');
    expect(scope.find('a/1 b/2')).toEqual('the value');
});

it('supports deletion', () => {
    const scope = new Scope();
    scope.insert('a/1 b/2', 'the value');
    expect(scope.find('a/1 b/2')).toEqual('the value');
    scope.deleteRelation('a/1 b/2');
    expect(scope.findOptional('a/1 b/2', null)).toEqual(null);
});

