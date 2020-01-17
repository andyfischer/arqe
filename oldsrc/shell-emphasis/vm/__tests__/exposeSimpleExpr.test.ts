
import { Scope, Graph } from '../../scope'
import exposeSimpleExpr from '../exposeSimpleExpr'
import { parseAsOneSimple } from '../../parse-query'

it('sets positional list', () => {
    const graph = new Graph()
    const scope = new Scope(graph)
    exposeSimpleExpr(scope, parseAsOneSimple("command b c"))
    expect(scope.get('#positionals')).toEqual(["command", "b", "c"]);
});

it('sets key-value options', () => {
    const graph = new Graph()
    const scope = new Scope(graph)
    exposeSimpleExpr(scope, parseAsOneSimple("command b=1 c=xyz"))
    expect(scope.get('b')).toEqual('1');
    expect(scope.get('c')).toEqual('xyz');
});
