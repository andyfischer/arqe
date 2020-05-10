import CommandConnection from './socket/CommandConnection';
export default class ClientRepl {
    conn: CommandConnection;
    repl: any;
    waitingForDone: boolean;
    constructor(conn: CommandConnection);
    receive(msg: string): void;
    eval(line: any): Promise<void>;
    displayPrompt(): void;
    start(): void;
}
