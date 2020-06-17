
import { Pattern, Stream, StorageProvider } from ".."
import ClientConnection, { connectToServer } from '../socket/ClientConnection'

const connectionByPort: { [port: string]: ClientConnection } = {}

async function getOrInitConnection(port: string) {
    if (!connectionByPort[port])
        connectionByPort[port] = await connectToServer(port);

    return connectionByPort[port];
}

class RemoteProvider implements StorageProvider {
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
}

export default function setup() {
    return new RemoteProvider();
}
