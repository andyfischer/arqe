
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
    error?: any

    waitingFor?: { [id: string]: boolean }
    waiters?: { [id: string]: boolean }
}

export default class VM {

    scope: Scope
    nextTaskId: number = 1

    tasks: { [id: string]: Task }

    // Transient state
    currentlyEvaluating: boolean
    queuedTasks: Task[] = []
    
    // External events
    onResult?: (taskId: number, result: RichValue) => void

    constructor() {
        this.scope = new Scope()
        this.scope.createSlot("#vm", this);
        this.currentlyEvaluating = false;
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
                    taskId = this.createSimpleTask(expr as SimpleExpr)
                }
            }
        });

        // TODO: keep running queued tasks

        return taskId;
    }

    createSimpleTask(expr: SimpleExpr) {

        const taskId = this.nextTaskId;
        this.nextTaskId += 1;

        const scope = simpleExprToScope(this.scope, expr);

        const task: Task = {
            id: this.nextTaskId,
            scope
        }

        this.runTask(task);

        return task.id;
    }

    queueTask(task: Task) {
        this.queuedTasks.push(task);
    }

    markTaskWaitingFor(task: Task, waitingForId: number) {
        task.waitingFor = task.waitingFor || {}
        task.waitingFor[waitingForId] = true;

        const waitingForTask = this.tasks[waitingForId];
        waitingForTask.waiters = waitingForTask.waiters || {}
        waitingForTask.waiters[task.id] = true;
    }

    markTaskFailed(task: Task, message: string) {
        task.error = message;
        task.done = true;

        // TODO: send message
    }
    
    markTaskDone(task: Task) {
        task.done = true;

        // TODO: check waiters
    }

    runTask(task: Task) {

        if (this.currentlyEvaluating) {
            this.queueTask(task);
            return;
        }

        this.currentlyEvaluating = true;

        // Check function.
        const commandName = task.scope.get('#commandName');
        const func = task.scope.get('#function:' + commandName);

        if (!commandName) {
            this.markTaskFailed(task, 'no command name found: ' + commandName);
            this.currentlyEvaluating = false;
            return;
        }

        // Resolve inputs.
        const resolveResult = resolveInputs(task.scope, func.inputs);

        if (resolveResult.errors.length > 0) {
            this.markTaskFailed(task, "error(s) resolving inputs: " + resolveResult.errors);
            this.currentlyEvaluating = false;
            return;
        }

        task.scope.createSlot('#resolvedInputs', resolveResult.values);

        if (resolveResult.pending.length > 0) {
            // Has pending inputs, finish it later.
            for (const pending of resolveResult.pending) {
                this.markTaskWaitingFor(task, pending.taskId);
            }
        } else {

            const resolvedInputs = resolveResult.values;
            const rawResult = func.callback.apply(null, resolvedInputs);

            for (let i = 0; i < func.outputs.length; i++) {
                const spec = func.outputs[i];
                this.handleEffect(outputValueToEffect(task.id, rawResult, spec));
            }

            task.done = true;
            this.currentlyEvaluating = false;
        }
    }

    resumeTask(task: Task) {
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
