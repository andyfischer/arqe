import Graph from './Graph';
import Runnable from './Runnable';
export default class ClientRepl {
    graph: Runnable;
    repl: any;
    constructor(graph: Runnable);
    eval(line: any): Promise<void>;
    displayPrompt(): void;
    start(): void;
}
export declare function startRepl(graph: Graph): ClientRepl;
