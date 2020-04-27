
import WebSocket from 'ws'
import ClientConnection from './ClientConnection'

const defaultUrl = 'http://localhost:42940'

export default async function openWebSocketClient() {
    const ws = new WebSocket(defaultUrl);

    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
    });

    ws.on('close', () => {
    });

    const commandConnection = new ClientConnection(ws);
    return commandConnection;
}
