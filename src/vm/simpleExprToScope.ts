
import { SimpleExpr } from '../parse-query/parseQueryV3'
import { Scope } from '../Scope'

export default function simpleExprToScope(parent: Scope, expr: SimpleExpr) {
    const scope = new Scope(parent)

    const positionals = []
    for (const arg of expr.args) {
        if (arg.keyword)
            positionals.push(arg.keyword);
        else
            scope.createSlot(arg.lhsName, arg.rhsValue);
    }

    scope.createSlot('#positionals', positionals);

    return scope;
}
