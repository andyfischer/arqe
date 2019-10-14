
import { SimpleExpr } from '../parse-query/parseQueryV3'
import { Scope } from '../Scope'

export default function simpleExprToScope(parent: Scope, expr: SimpleExpr) {
    const scope = new Scope(parent)

    const positionals = []
    for (const arg of expr.args) {
        if (arg.keyword)
            positionals.push(arg.keyword);
        else
            scope.createSlotAndSet(arg.lhsName, arg.rhsValue);
    }

    scope.createSlotAndSet('#positionals', positionals);
    scope.createSlotAndSet('#commandName', positionals[0]);

    return scope;
}
