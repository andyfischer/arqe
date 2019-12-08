
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import CommandConnection from './CommandConnection'
import Minimist from 'minimist'

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {
    });

    console.log('cliArgs: ', cliArgs);

    const ws = new WebSocket('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    const commandConnection = new CommandConnection(ws);

    if (cliArgs._.length > 0) {
        const command = cliArgs._.join(' ');

        const result = await commandConnection.run(command);
        commandConnection.close();
        return;
    }

    const repl = new ClientRepl(commandConnection);
    repl.start();
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
