
import Graph from '../Graph'
import WebSocket from 'ws'
import Repl from 'repl'
import IDSource from '../utils/IDSource'
import MinecraftServerAPI from './generated/MinecraftServerAPI'

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
        console.log(`[mc] connection ${id} opened`);

        conn.onerror = (err) => { console.error('ws error: ' + err) }

        conn.onmessage = (evt) => {
            const { data } = evt;
            receive(conn, id, data);
        }

        conn.onclose = () => {
            console.log(`[mc] connection ${id} closed`);
            activeConnections.delete(id)
        }

        /*
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
        */
    });

    return wsServer;
}

function receive(conn, connId, data) {
    console.log(`[${connId}] received: ${JSON.stringify(data)}`);
    const message = JSON.parse(data);

    const reqId = message.header.requestId;
    messageListeners[reqId](message);
    delete messageListeners[reqId];
}

let server;
const nextConnId = new IDSource();
const nextRequestId = new IDSource();
const activeConnections = new Map();

const messageListeners = {}

/*
const repl = Repl.start({
    prompt: '~ ',
    eval: line => {
        for (const conn of activeConnections.values()) {
        }
    }
});
*/

async function sendCommand(commandLine: string) {

    if (activeConnections.size === 0)
        throw new Error("no active connections");

    for (const conn of activeConnections.values()) {

        const reqId = nextRequestId.take();

        conn.send(JSON.stringify({
            body: {
                commandLine,
                version: 1
            },
            header: {
                requestId: reqId,
                messagePurpose: 'commandRequest',
                version: 1,
            }
        }))

        const response = await new Promise<any>(resolve => {
            messageListeners[reqId] = resolve;
        });

        if (response.body.statusCode === 0) {
            return response.body;

        } else {
            console.log('MC replied with error: ', JSON.stringify(response))
            throw new Error(response.body.statusMessage);
        }
    }
}

export default function setup() {
    if (!server) {
        server = createWsServer();
        console.log(`Minecraft server listening on port ${PORT}`)
    }

    return new MinecraftServerAPI({
        async readBlock(x, y, z) {
            const result = await sendCommand(`/data get block ${x} ${y} ${z}`);
        },
        async setBlock(x, y, z, block) {
            await sendCommand(`/setblock ${x} ${y} ${z} ${block} 0 replace`);
        }
    });
}
