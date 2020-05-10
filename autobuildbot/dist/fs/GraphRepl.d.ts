import Runnable from './Runnable';
export default class GraphRepl {
    graph: Runnable;
    repl: any;
    constructor(graph: Runnable);
    eval(line: any, onDone: any): Promise<void>;
}
