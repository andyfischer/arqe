
import WebSocket from 'ws'
import CommandConnection from './CommandConnection'

const defaultUrl = 'http://localhost:42940'

export default async function openWebSocketClient() {
    const ws = new WebSocket(defaultUrl);
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });

    ws.on('close', () => {
    });

    const commandConnection = new CommandConnection(ws);
    return commandConnection;
}
