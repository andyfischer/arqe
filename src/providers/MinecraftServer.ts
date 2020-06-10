
import Graph from '../Graph'
import WebSocket from 'ws'
import Repl from 'repl'
import IDSource from '../utils/IDSource'
//import MinecraftServerAPI from './generated/MinecraftServerAPI'

const PORT = 4000;

async function createWsServer() {
    const wsServer = new WebSocket.Server({
      port: PORT,
      perMessageDeflate: {
        zlibDeflateOptions: {
          // See zlib defaults.
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
      }
    });

    wsServer.on('error', err => console.error('wsserver error: ' + err));

    wsServer.on('connection', (conn) => {

        const id = nextConnId.take();
        activeConnections.set(id, conn);
        console.log(`(connection ${id} opened)`);

        conn.onerror = (err) => { console.error('ws error: ' + err) }

        conn.onmessage = (data) => {
            receive(conn, id, data);
        }

        conn.onclose = () => {
            console.log(`(connection ${id} closed)`);
            activeConnections.delete(id)
        }

        // TEST
        conn.send(JSON.stringify({
            body: {
                commandLine: "/setblock 0 90 0 grass 0 replace",
                version: 1
            },
            header: {
                requestId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                messagePurpose: 'commandRequest',
                version: 1,
            }
        }))
    });

    return wsServer;
}

function receive(conn, connId, data) {
    console.log(`[${connId}] received: ${data}`);
}

const server = createWsServer();
console.log(`Listening on port ${PORT}`)
const nextConnId = new IDSource();
const activeConnections = new Map();

const repl = Repl.start({
    prompt: '~ ',
    eval: line => {
        for (const conn of activeConnections.values()) {
        }
    }
});


export default function setup(graph: Graph) {
    //return new MinecraftServerAPI({ });
}
