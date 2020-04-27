import ClientConnection from '../socket/ClientConnection'
import connect from '../socket/openWebSocketClient'

let _processClient: ClientConnection = null;

export default async function getProcessClient() {
    if (_processClient === null) {
        _processClient = await connect();
    }

    return _processClient;
}
