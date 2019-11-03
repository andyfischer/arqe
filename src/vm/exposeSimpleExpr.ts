
import { SimpleExpr } from '../parse-query/parseQueryV3'
import { Scope } from '../Scope'

export default function exposeSimpleExpr(scope: Scope, expr: SimpleExpr) {

    const positionals = [];
    const commandOptions = {};

    for (const arg of expr.args) {
        if (arg.keyword) {
            positionals.push(arg.keyword);
        } else {
            commandOptions[arg.lhsName] = arg.rhsValue;
            scope.createSlotAndSet(arg.lhsName, arg.rhsValue);
        }
    }

    scope.createSlotAndSet('#positionals', positionals);
    scope.createSlotAndSet('#commandName', positionals[0]);
    scope.createSlotAndSet('#commandOptions', commandOptions);
}
