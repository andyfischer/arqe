
import { parseQueries } from '../parse-query'
import { SimpleExpr } from '../parse-query/parseQueryV3'
import { RichValue } from '../rich-value'
import { Scope } from '../Scope'
import FunctionDefinition from './FunctionDefinition'
import simpleExprToScope from './simpleExprToScope'
import VMEffect from './VMEffect'
import mountFunction from './mountFunction'
import resolveInputs from './resolveInputs'
import outputValueToEffects from './outputValueToEffects'
import handleEffect from './handleEffect'
import Task from './Task'
import { print } from '..'

const MissingValue = Symbol('missing');

export default class VM {

    scope: Scope
    nextTaskId: number = 1

    tasks: { [id: string]: Task } = {}

    // Transient state
    currentlyEvaluating: boolean
    queuedTaskIds: string[] = []
    
    // External events
    onLog?: (message: string) => void
    onResult?: (taskId: number, result: RichValue) => void

    constructor(scope?: Scope) {
        scope = scope || new Scope()
        this.scope = scope;
        this.scope.createSlotAndSet("#vm", this);
        this.currentlyEvaluating = false;
    }

    log(message: string) {
        this.onLog && this.onLog(message);
    }

    mountFunction(name: string, def: FunctionDefinition) {
        mountFunction(this.scope, name, def);
    }

    evaluateSync(query: string) {

        this.log("evaluate-sync -- " + query);

        if (this.currentlyEvaluating)
            throw new Error("VM is currently evaluating, can't call .evaluateSync");

        const taskId = this.evaluateQuery(query);

        this.completeTaskQueue();

        const task = this.tasks[taskId];
        if (!task.done)
            throw new Error(`task ${taskId} didn't finish synchronously in evaluateSync`);

        if (task.error)
            throw new Error(task.error);

        this.log("finished-evaluate-sync -- " + query);

        return task.result;
    }

    evaluateMultiLine(contents: string) {
        //parseMultiLine();
    }

    evaluateQuery(query: string) {
        let mainTaskId;

        this.log('evaluate-query -- ' + query);

        parseQueries({
            text: query,
            onExpr: (expr) => {
                if (expr.type === 'simple') {
                    mainTaskId = this.createSimpleTask(expr as SimpleExpr)
                    this.log(`created-simple-task taskId=${mainTaskId} -- ${expr.originalStr}`);
                } else {
                    print('error: unrecognized expr type: ' + expr.type);
                }
            }
        });

        return mainTaskId;
    }

    createSimpleTask(expr: SimpleExpr) {

        const taskId = this.nextTaskId;
        this.nextTaskId += 1;

        const scope = simpleExprToScope(this.scope, expr);

        const task: Task = {
            id: this.nextTaskId+'',
            scope
        }

        this.tasks[task.id] = task;

        this.runTask(task);

        return task.id;
    }

    queueTask(id: string) {
        this.queuedTaskIds.push(id);
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
            this.queueTask(task.id);
            return;
        }

        this.currentlyEvaluating = true;

        // Check function.
        const commandName = task.scope.get('#commandName');
        const func = task.scope.getOptional('#function:' + commandName, MissingValue);

        if (func === MissingValue) {
            this.markTaskFailed(task, 'command not found: ' + commandName);
            this.currentlyEvaluating = false;
            return;
        }

        // Resolve inputs.
        const resolveResult = resolveInputs(this, task, func.inputs);

        if (resolveResult.errors.length > 0) {
            this.markTaskFailed(task, "error(s) resolving inputs: " + resolveResult.errors);
            this.currentlyEvaluating = false;
            return;
        }

        if (resolveResult.hasPending) {
            this.currentlyEvaluating = false;
            return;
        }

        const resolvedInputs = resolveResult.values;
        const rawResult = func.callback.apply(null, resolvedInputs);

        for (let i = 0; i < func.outputs.length; i++) {
            const spec = func.outputs[i];

            for (const effect of outputValueToEffects(task, rawResult, spec)) {
                handleEffect(this, effect);
            }
        }

        task.done = true;
        this.currentlyEvaluating = false;

        this.log(`finished-task taskId=${task.id}`)

        for (const triggerTaskId in this.scope.findPairsWithKey('taskId', task.id, 'trigger')) {
            this.log(`triggering-downstream-task taskId=${triggerTaskId}`)
            this.queueTask(triggerTaskId);
        }
    }

    completeTaskQueue() {

        if (this.currentlyEvaluating)
            throw new Error("can't call completeTaskQueue while currentlyEvaluating is true");

        let iterations = 0;

        while (this.queuedTaskIds.length > 0) {
            iterations += 1;
            if (iterations > 100)
                throw new Error("too many iterations in completeTaskQueue");

            const next = this.queuedTaskIds.shift();
            this.runTask(this.tasks[next]);

            if (this.currentlyEvaluating)
                throw new Error("currentlyEvaluating was still true after runTask");
        }
    }
}
