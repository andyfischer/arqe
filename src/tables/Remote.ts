
import Tuple from '../Tuple'
import { Stream } from ".."
// import ClientConnection, { connectToServer } from '../socket/ClientConnection'
import { handles } from '../decorators'
import TableMount from '../TableMount'
import WebSocket from '../platform/ws'


/*
async function getOrInitConnection(port: string) {
    if (!connectionByPort[port])
        connectionByPort[port] = await connectToServer(port);

    return connectionByPort[port];
}
*/

export function remoteTable(name: string, schema: Tuple) {
    const mount = new TableMount(name, schema);

    // mount.addHandler('get')
}

export class Remote {
    name = 'Remote'
    schemaStr = 'remote/$port **'
    supportsCompleteScan = false

    @handles('get remote/xxx')
    select(pattern: Tuple, out: Stream) {
    }

    insert(tuple: Tuple, out: Stream) {
    }

    delete(search: Tuple, out: Stream) {
    }
}

/*
    intercept any command and forward to remote server
*/
