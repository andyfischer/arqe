"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_query_1 = require("../parse-query");
const Scope_1 = require("../Scope");
const exposeSimpleExpr_1 = __importDefault(require("./exposeSimpleExpr"));
const mountFunction_1 = __importDefault(require("./mountFunction"));
const resolveInputs_1 = __importDefault(require("./resolveInputs"));
const outputValueToEffects_1 = __importDefault(require("./outputValueToEffects"));
const handleEffect_1 = __importDefault(require("./handleEffect"));
const __1 = require("..");
const MissingValue = Symbol('missing');
class VM {
    constructor(scope) {
        this.nextTaskId = 1;
        this.tasks = {};
        this.queuedTaskIds = [];
        this.graph = new Scope_1.Graph();
        scope = scope || new Scope_1.Scope(this.graph);
        this.scope = scope;
        this.scope.createSlotAndSet("#vm", this);
        this.currentlyEvaluating = false;
    }
    log(message) {
        this.onLog && this.onLog(message);
    }
    mountFunction(name, def) {
        mountFunction_1.default(this.scope, name, def);
    }
    evaluateSync(query) {
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
    evaluateMultiLine(contents) {
    }
    evaluateQuery(query) {
        let mainTaskId;
        this.log('evaluate-query -- ' + query);
        parse_query_1.parseQueries({
            text: query,
            onExpr: (expr) => {
                if (expr.type === 'simple') {
                    mainTaskId = this.createSimpleTask(expr);
                    this.log(`created-simple-task taskId=${mainTaskId} -- ${expr.originalStr}`);
                }
                else {
                    __1.print('error: unrecognized expr type: ' + expr.type);
                }
            }
        });
        return mainTaskId;
    }
    createSimpleTask(expr) {
        const taskId = this.nextTaskId;
        this.nextTaskId += 1;
        const graph = new Scope_1.Graph(this.graph);
        const scope = new Scope_1.Scope(graph);
        exposeSimpleExpr_1.default(scope, expr);
        const task = {
            id: this.nextTaskId + '',
            scope
        };
        this.tasks[task.id] = task;
        this.runTask(task);
        return task.id;
    }
    queueTask(id) {
        this.queuedTaskIds.push(id);
    }
    markTaskFailed(task, message) {
        task.error = message;
        task.done = true;
        __1.print("error: " + message);
    }
    markTaskDone(task) {
        task.done = true;
    }
    runTask(task) {
        if (this.currentlyEvaluating) {
            this.queueTask(task.id);
            return;
        }
        this.currentlyEvaluating = true;
        const commandName = task.scope.get('#commandName');
        const func = task.scope.getOptional('#function:' + commandName, MissingValue);
        if (func === MissingValue) {
            this.markTaskFailed(task, 'command not found: ' + commandName);
            this.currentlyEvaluating = false;
            return;
        }
        const resolveResult = resolveInputs_1.default(this, task, func.inputs);
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
            for (const effect of outputValueToEffects_1.default(task, rawResult, spec)) {
                handleEffect_1.default(this, effect);
            }
        }
        task.done = true;
        this.currentlyEvaluating = false;
        this.log(`finished-task taskId=${task.id}`);
        for (const match of this.graph.findExt(`task/${task.id} trigger/*`)) {
            const triggerTaskId = match.remainingTag;
            this.log(`triggering-downstream-task task=${triggerTaskId}`);
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
exports.default = VM;
//# sourceMappingURL=VM.js.map