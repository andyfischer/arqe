
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

    constructor(conn: CommandConnection) {
        this.conn = conn;
    }

    receive(msg: string) {
        console.log(' > ' + msg);
    }

    async eval(line) {
        line = trimEndline(line);

        await new Promise((resolve, reject) => {
            this.conn.run(line, response => {
                this.receive(response);
                resolve();
            })
        })

        this.displayPrompt()
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
