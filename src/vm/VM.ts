
import { parseSingleLine } from '../parse-query'
import { SimpleExpr } from '../parse-query/parseQueryV3'
import { RichValue } from '../rich-value'
import { Scope } from '../Scope'
import FunctionMount, { FunctionMountShorthand, fixMountShorthand } from './FunctionMount'
import simpleExprToScope from './simpleExprToScope'
import VMEffect from './VMEffect'
import { assertOutputSpecs } from './validateOutputSpecs'
import resolveInputs from './resolveInputs'
import outputValueToEffect from './outputValueToEffect'

interface Task {
    id: number
    scope: Scope
    done?: boolean
    result?: any
}

export default class VM {

    scope: Scope
    nextTaskId: number = 1

    tasks: { [id: string]: Task }
    
    onResult?: (taskId: number, result: RichValue) => void

    constructor() {
        this.scope = new Scope()
        this.scope.createSlot("#vm", this);
    }

    mountFunction(name: string, mount: FunctionMount) {
        assertOutputSpecs(mount.outputs);
        this.scope.createSlot('#function:' + name, mount);
    }

    mountFunctionShorthand(name: string, shorthand: FunctionMountShorthand) {
        const mount: FunctionMount = fixMountShorthand(shorthand);
        assertOutputSpecs(mount.outputs);
        this.scope.createSlot('#function:' + name, mount);
    }

    executeQueryString(query: string, options: {} = {}) {

        let taskId;

        parseSingleLine({
            text: query,
            onExpr: (expr) => {
                if (expr.type === 'simple') {
                    taskId = this.executeSimple(expr as SimpleExpr)
                }
            }
        });

        return taskId;
    }

    executeSimple(expr: SimpleExpr) {

        const taskId = this.nextTaskId;
        this.nextTaskId += 1;

        const scope = simpleExprToScope(this.scope, expr);

        const task: Task = {
            id: this.nextTaskId,
            scope
        }

        this.taskStart(task);

        return task.id;
    }

    taskStart(task: Task) {
        // Check function.

        const commandName = task.scope.get('#commandName');
        const func = task.scope.get('#function:' + commandName);

        if (!commandName)
            throw new Error('no command name found: ' + commandName);

        // Resolve inputs.
        const resolved = resolveInputs(task.scope, func.inputs);

        if (resolved.errors.length > 0)
            throw new Error("error(s) resolving inputs: " + resolved.errors);

        task.scope.createSlot('#resolvedInputs', resolved.values);

        if (resolved.pending.length > 0) {
        } else {
            this.taskRunCallback(task);
        }
    }

    taskRunCallback(task: Task) {

        const commandName = task.scope.get('#commandName');
        const func = task.scope.get('#function:' + commandName);
        const resolvedInputs = task.scope.get('#resolvedInputs');
        const rawResult = func.callback.apply(null, resolvedInputs);

        for (let i = 0; i < func.outputs.length; i++) {
            const spec = func.outputs[i];
            this.handleEffect(outputValueToEffect(task.id, rawResult, spec));
        }
    }

    handleEffect(effect: VMEffect) {

        switch (effect.type) {
        case 'set-env':
            this.scope.set(effect.name, effect.value);
            return;

        case 'emit-result':
            this.onResult(effect.taskId, effect.value);
            return;
        }

        throw new Error('unhandled effect.type: '  + effect.type);
    }

    handleCommandResponse(taskId: number, val: RichValue) {
        this.onResult(taskId, val);
    }
}
