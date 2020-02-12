
import 'source-map-support'
import WebSocket from 'ws'
import ClientRepl from './ClientRepl'
import CommandConnection from './socket/CommandConnection'
import Minimist from 'minimist'

export default async function main() {
    const cliArgs = Minimist(process.argv.slice(2), {});

    const ws = new WebSocket('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    ws.on('close', () => {
        console.log('Disconnected from server');
        process.exit();
    });

    const commandConnection = new CommandConnection(ws);
    
    // Temp
    commandConnection.run('set wstest schema provider/wssync', () => null)
    commandConnection.run('set wstest schema provider/wssync .host == http://localhost:42941', () => null)

    if (cliArgs._.length > 0) {
        const command = cliArgs._.join(' ');

        //const response = await commandConnection.runGetFullResponse(command);
        //console.log(response);
        //return;
    }

    const repl = new ClientRepl(commandConnection);
    repl.start();
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
