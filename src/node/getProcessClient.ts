import ClientConnection, { connectToServer } from '../node/socket/ClientConnection'

let _processClient: ClientConnection = null;

export default async function getProcessClient() {
    if (_processClient === null) {
        const port = process.env.PORT || '42940'
        _processClient = await connectToServer(port);
    }

    return _processClient;
}
