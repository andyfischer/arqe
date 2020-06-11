
import { Pattern, TupleReceiver, StorageProvider } from ".."
import ClientConnection, { connectToServer } from '../socket/ClientConnection'

const connectionByPort: { [port: string]: ClientConnection } = {}

async function getOrInitConnection(port: string) {
    if (!connectionByPort[port])
        connectionByPort[port] = await connectToServer(port);

    return connectionByPort[port];
}

class RemoteProvider implements StorageProvider {
    async runSearch(pattern: Pattern, output: TupleReceiver) {
        const port = pattern.getVal("remote");
        const forwarded = pattern.removeAttr("remote");
        const conn = await getOrInitConnection(port);
        conn.run('get ' + forwarded.stringify(), {
            relation(rel) {
                output.relation(rel.setVal("remote", port))
            },
            finish() {
                output.finish()
            }
        });
    }

    async runSave(pattern: Pattern, output: TupleReceiver) {
        const port = pattern.getVal("remote");
        const forwarded = pattern.removeAttr("remote");
        const conn = await getOrInitConnection(port);
        conn.run('set ' + forwarded.stringify(), {
            relation(rel) {
                output.relation(rel.setVal("remote", port))
            },
            finish() {
                output.finish()
            }
        });
    }
}

export default function setup() {
    return new RemoteProvider();
}
