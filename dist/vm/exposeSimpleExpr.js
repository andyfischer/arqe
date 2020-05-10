"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function exposeSimpleExpr(scope, expr) {
    const positionals = [];
    const commandOptions = {};
    for (const arg of expr.args) {
        if (arg.keyword) {
            positionals.push(arg.keyword);
        }
        else {
            commandOptions[arg.lhsName] = arg.rhsValue;
            scope.createSlotAndSet(arg.lhsName, arg.rhsValue);
        }
    }
    scope.createSlotAndSet('#positionals', positionals);
    scope.createSlotAndSet('#commandName', positionals[0]);
    scope.createSlotAndSet('#commandOptions', commandOptions);
}
exports.default = exposeSimpleExpr;
//# sourceMappingURL=exposeSimpleExpr.js.map