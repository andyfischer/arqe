
import 'source-map-support'
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import CommandConnection from './socket/CommandConnection'
import Minimist from 'minimist'

function waitUntilDone() {
    let check;
    let streaming = false;
    let first = true;

    const promise = new Promise((resolve, reject) => {

        check = (msg) => {
            if (first && msg === '#start') {
                streaming = true;
            }

            first = false;

            if (!streaming)
                resolve();
            if (msg === '#done')
                resolve();
        }
    });

    return { check, promise }
}

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {
    });

    const ws = new WebSocket('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    const commandConnection = new CommandConnection(ws);
    await commandConnection.setup();

    if (cliArgs._.length > 0) {
        const command = cliArgs._.join(' ');

        console.log(result);
        commandConnection.close();
        return;
    }

    const repl = new ClientRepl(commandConnection);
    repl.start();

    // TODO: gracefully close connection on exit
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
