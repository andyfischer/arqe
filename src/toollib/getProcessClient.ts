import ClientConnection, { connectToServer } from '../socket/ClientConnection'

let _processClient: ClientConnection = null;

export default async function getProcessClient() {
    if (_processClient === null) {
        _processClient = await connectToServer();
    }

    return _processClient;
}
