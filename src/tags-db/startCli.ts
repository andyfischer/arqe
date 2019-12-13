
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import CommandConnection from './CommandConnection'
import Minimist from 'minimist'

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {
    });

    const ws = new WebSocket('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    const commandConnection = new CommandConnection(ws);
    await commandConnection.setup();
    await commandConnection.linkWithThisProcess();

    if (cliArgs._.length > 0) {
        const command = cliArgs._.join(' ');

        const result = await commandConnection.run(command);
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
