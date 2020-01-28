
import Repl from 'repl'
import CommandConnection from './socket/CommandConnection'

const prompt = '~ '

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

export default class ClientRepl {
    conn: CommandConnection
    repl: any

    waitingForDone: boolean

    constructor(conn: CommandConnection) {
        this.conn = conn;
        this.waitingForDone = false;
    }

    receive(msg: string) {
        if (msg === '#start') {
            this.waitingForDone = true;
            return;
        }

        if (msg === '#done') {
            this.waitingForDone = false;
            this.displayPrompt()
            return;
        }

        console.log(' > ' + msg);

        if (!this.waitingForDone)
            this.displayPrompt()
    }

    async eval(line) {
        line = trimEndline(line);

        this.conn.run(line, response => {
            this.receive(response);
        })

    }

    displayPrompt() {
        this.repl.displayPrompt()
    }

    start() {
        this.repl = Repl.start({
            prompt,
            eval: line => this.eval(line)
        });
    }
}
