
import { parseSingleLine } from '../parse-query'
import { SimpleExpr } from '../parse-query/parseQueryV3'
import { RichValue } from '../rich-value'
import { Scope } from '../Scope'
import FunctionMount from './FunctionMount'
import simpleExprToScope from './simpleExprToScope'
import runMountedFunction from './runMountedFunction'

export default class VM {

    scope: Scope
    _nextExecId: number = 1
    
    functionMounts: { [name: string]: FunctionMount } = {}
    onResult?: (execId: number, result: RichValue) => void

    mountFunction(name: string, mount: FunctionMount) {
        this.functionMounts[name] = mount;
    }

    executeQueryString(query: string, options: {}) {
        parseSingleLine({
            text: query,
            onExpr: (expr) => {
                if (expr.type === 'simple')
                    this.executeSimple(expr as SimpleExpr)
            }
        });
    }

    executeSimple(expr: SimpleExpr) {

        const execId = this._nextExecId;
        this._nextExecId += 1;

        const scope = simpleExprToScope(this.scope, expr);
        const commandName = scope.get('#positionals')[0];

        const funcMount = this.functionMounts[commandName];

        if (!commandName)
            throw new Error('no command name found: ' + commandName);

        runMountedFunction(funcMount, scope);
        return execId;
    }

    handleCommandResponse(execId: number, val: RichValue) {
        this.onResult(execId, val);
    }
}
