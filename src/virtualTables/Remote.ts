
import Tuple from '../Tuple'
import { Pattern, Stream } from ".."
import ClientConnection, { connectToServer } from '../socket/ClientConnection'
import TableStorage, { } from '../TableStorage'

const connectionByPort: { [port: string]: ClientConnection } = {}

async function getOrInitConnection(port: string) {
    if (!connectionByPort[port])
        connectionByPort[port] = await connectToServer(port);

    return connectionByPort[port];
}

export class Remote implements TableStorage {
    name = 'Remote'
    schema = 'remote/$port **'
    supportsCompleteScan = false

    select(pattern: Tuple, out: Stream) {
    }

    insert(tuple: Tuple, out: Stream) {
    }

    delete(search: Tuple, out: Stream) {
    }

    /*
    async runSearch(pattern: Pattern, output: Stream) {
        const port = pattern.getVal("remote");
        const forwarded = pattern.removeAttr("remote");
        const conn = await getOrInitConnection(port);
        conn.run('get ' + forwarded.stringify(), {
            next(rel) {
                output.next(rel.setVal("remote", port))
            },
            done() {
                output.done()
            }
        });
    }

    async runSave(pattern: Pattern, output: Stream) {
        const port = pattern.getVal("remote");
        const forwarded = pattern.removeAttr("remote");
        const conn = await getOrInitConnection(port);
        conn.run('set ' + forwarded.stringify(), {
            next(rel) {
                output.next(rel.setVal("remote", port))
            },
            done() {
                output.done()
            }
        });
    }
    */
}
