
import Tuple from '../Tuple'
import { Pattern, Stream } from ".."
import ClientConnection, { connectToServer } from '../socket/ClientConnection'
import TableInterface, { TupleModifier } from '../TableInterface'

const connectionByPort: { [port: string]: ClientConnection } = {}

async function getOrInitConnection(port: string) {
    if (!connectionByPort[port])
        connectionByPort[port] = await connectToServer(port);

    return connectionByPort[port];
}

export class Remote implements TableInterface {
    name = 'Remote'
    schema = 'remote/$port **'
    supportsCompleteScan = false

    search(pattern: Tuple, out: Stream) {
    }

    insert(tuple: Tuple, out: Stream) {
    }

    update(search: Tuple, modifier: TupleModifier, out: Stream) {
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
