
import { SimpleExpr } from '../parse-query/parseQueryV3'
import VM from './VM'
import { Scope } from '../scope'

export default class CommandContext {
    vm: VM
    execId: number
    syntax: SimpleExpr
    positionals: string[] = []
    keyValues: { [key: string]: string } = {}
    scope: Scope

    constructor(vm: VM) {
        this.vm = vm;
    }

    get(name: string) {
        return this.scope.get(name);
    }

    input(index: number) {
        return this.positionals[index];
    }

    options() {
        return this.keyValues;
    }

    respond(val) {
        this.vm.handleCommandResponse(this.execId, val);
    }
}

export function simpleExprToCommandContext(vm: VM, expr: SimpleExpr) {
    const context = new CommandContext(vm)
    context.syntax = expr;

    for (const arg of expr.args) {
        if (arg.keyword)
            context.positionals.push(arg.keyword);
        else if (arg.lhsName)
            context.keyValues[arg.lhsName] = arg.rhsValue;
    }

    return context
}
