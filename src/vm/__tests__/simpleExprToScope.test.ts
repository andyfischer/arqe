
import { Scope } from '../../scope'
import simpleExprToScope from '../simpleExprToScope'
import { parseAsOneSimple } from '../../parse-query'

it('sets positional list', () => {
    const parent = new Scope()
    const scope = simpleExprToScope(parent, parseAsOneSimple("command b c"))
    expect(scope.get('#positionals')).toEqual(["command", "b", "c"]);
});

it('sets key-value options', () => {
    const parent = new Scope()
    const scope = simpleExprToScope(parent, parseAsOneSimple("command b=1 c=xyz"))
    expect(scope.get('b')).toEqual('1');
    expect(scope.get('c')).toEqual('xyz');
});
