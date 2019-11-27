
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import CommandConnection from './CommandConnection'

export default async function main() {
    const ws = new WebSocket('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });
    const commandConnection = new CommandConnection(ws);

    const repl = new ClientRepl(commandConnection);
    repl.start();
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
