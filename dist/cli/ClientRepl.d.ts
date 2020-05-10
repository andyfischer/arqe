interface Runnable {
    run: (msg: string, callback: (response: string) => void) => void;
}
export default class ClientRepl {
    graph: Runnable;
    repl: any;
    waitingForDone: boolean;
    constructor(graph: Runnable);
    receive(msg: string): void;
    eval(line: any): Promise<void>;
    displayPrompt(): void;
    start(): void;
}
export {};
