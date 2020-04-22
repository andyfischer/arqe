import CommandConnection from '../socket/CommandConnection'
import connect from '../socket/openWebSocketClient'

let _processClient: CommandConnection = null;

export default async function getProcessClient() {
    if (_processClient === null) {
        _processClient = await connect();
    }

    return _processClient;
}
