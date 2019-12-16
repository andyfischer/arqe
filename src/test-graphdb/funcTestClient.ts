
import WebSocket from 'ws'
import CommandConnection from '../CommandConnection'
import mainFunctionalTests from './mainFunctionalTests'
import ClientRepl from '../ClientRepl'

export default async function main() {
    const ws = new WebSocket('http://localhost:42940');
    const commandConnection = new CommandConnection(ws);

    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    await commandConnection.setup();

    console.log('Running functional tests..')
    await mainFunctionalTests(commandConnection);

    commandConnection.close();
}

main()
.catch(err => {
    process.exitCode = -1;
    console.error(err);
});
