
import WebSocket from 'ws'
import CommandConnection from './CommandConnection'
import { mainFunctionalTests } from './FunctionalTests'

export default async function main() {
    const ws = new WebSocket('http://localhost:42940');

    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    console.log('client: Connected to server');

    const commandConnection = new CommandConnection(ws);
    await mainFunctionalTests(commandConnection);
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
