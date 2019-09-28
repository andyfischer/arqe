
import { SimpleExpr } from '../parse-query/parseQueryV3'
import VM from './VM'


export default class CommandContext {
    vm: VM
    execId: number
    syntax: SimpleExpr
    positionals: string[] = []
    keyValues: { [key: string]: string } = {}

    constructor(vm: VM) {
        this.vm = vm;
    }

    input(index: number) {
        return this.positionals[index];
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
