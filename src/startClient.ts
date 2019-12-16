
import 'source-map-support'
import WebSocket from 'ws'
import CommandConnection from './CommandConnection'
import { mainFunctionalTests } from './test-graphdb'
import ClientRepl from './ClientRepl'

export default async function main() {
    const ws = new WebSocket('http://localhost:42940');

    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    console.log('client: Connected to server');

    const commandConnection = new CommandConnection(ws);
    await mainFunctionalTests(commandConnection);

    //const repl = new ClientRepl(commandConnection);
    //repl.start();
    //commandConnection.close();
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
