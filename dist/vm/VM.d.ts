import { SimpleExpr } from '../parse-query/parseQueryV3';
import { RichValue } from '../rich-value';
import { Scope, Graph } from '../Scope';
import FunctionDefinition from './FunctionDefinition';
import Task from './Task';
export default class VM {
    scope: Scope;
    graph: Graph;
    nextTaskId: number;
    tasks: {
        [id: string]: Task;
    };
    currentlyEvaluating: boolean;
    queuedTaskIds: string[];
    onLog?: (message: string) => void;
    onResult?: (taskId: number, result: RichValue) => void;
    constructor(scope?: Scope);
    log(message: string): void;
    mountFunction(name: string, def: FunctionDefinition): void;
    evaluateSync(query: string): any;
    evaluateMultiLine(contents: string): void;
    evaluateQuery(query: string): any;
    createSimpleTask(expr: SimpleExpr): string;
    queueTask(id: string): void;
    markTaskFailed(task: Task, message: string): void;
    markTaskDone(task: Task): void;
    runTask(task: Task): void;
    completeTaskQueue(): void;
}
