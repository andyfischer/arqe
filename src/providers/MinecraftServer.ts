
import Graph from '../Graph'
import WebSocket from 'ws'
import Repl from 'repl'
import IDSource from '../utils/IDSource'
import MinecraftServerAPI from './generated/MinecraftServerAPI'
import BlockDb from './BlockDb'
import Predefs, { move } from './MinecraftPredefs'
import Tuple from '../Tuple'

//const concurrentCommandCount = 30;
const concurrentCommandCount = 10;
//const concurrentCommandCount = 1;
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

function blockNameToId(name: string): string {
    for (const id in BlockDb)
        if (BlockDb[id] === name)
            return id;

    console.log(`couldn't find block id for: ${name}`);

    return null;
}

async function sendCommand(commandLine: string) {

    console.log('sending: ' + commandLine);

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

        return new Promise<any>(resolve => {
            messageListeners[reqId] = resolve;
        });
    }
}

function expectSuccess(response) {
    if (response.body.statusCode !== 0) {
        console.log('MC replied with error: ', JSON.stringify(response))
        throw new Error(response.body.statusMessage);
    }
}

let lastBlockSet = [];

async function runCommandsConcurrent(commands: Tuple[]) {
    const promises = []
    for (const c of commands) {

        if (!c.hasAttr("command") || c.getVal("command") === 'setblock') {
            const data = c.getValOptional("data", "0");
            const command = `/setblock ${c.getVal("x")} ${c.getVal("y")} ${c.getVal("z")}  ${c.getVal("block")} ${data} replace`;
            promises.push(sendCommand(command));
        } else if (c.getVal("command") === 'fill') {
            const data = c.getValOptional("data", "0");
            const handling = c.getValOptional('handling', 'replace');
            const command = `/fill ${c.getVal("x")} ${c.getVal("y")} ${c.getVal("z")} ${c.getVal("x2")} ${c.getVal("y2")} ${c.getVal("z2")} ${c.getVal("block")} ${data} ${handling}`
        }
    }
    await Promise.all(promises);
}

async function runCommands(commands: Tuple[]) {
    while (commands.length > 0) {
        const next = commands.slice(0, concurrentCommandCount);
        commands = commands.slice(concurrentCommandCount);
        await runCommandsConcurrent(next);
    }
}

export default function setup() {
    if (!server) {
        server = createWsServer();
        console.log(`Minecraft server listening on port ${PORT}`)
    }

    return new MinecraftServerAPI({
        async readBlock(x, y, z) {
            const response = await sendCommand(`/testforblock ${x} ${y} ${z} air`);

            const message = response.body.statusMessage;

            const regex = /The block at [0-9]+,[0-9]+,[0-9]+ is (.*) \(/
            const match = regex.exec(message)

            if (match) {
                return blockNameToId(match[1]);
            }

            if (/Successfully/.exec(message))
                return 'air'

            throw new Error("didn't understand status message: " + message);
        },
        async setBlock(x, y, z, block) {
            const response = await sendCommand(`/setblock ${x} ${y} ${z} ${block} 0 replace`);
            expectSuccess(response);
        },
        async setBlockWithData(x, y, z, block, data) {
            const response = await sendCommand(`/setblock ${x} ${y} ${z} ${block} ${data} replace`);
            expectSuccess(response);
        },
        async setPredef(x, y, z, predef) {
            if (!Predefs[predef])
                throw new Error("predef not found: " + predef);

            const sets = [];

            for (let set of Predefs[predef]()) {
                set = move(set, parseInt(x), parseInt(y), parseInt(z));
                sets.push(set);
            }

            await runCommands(sets);
            lastBlockSet = sets;
        },

        async undo() {

            await runCommands(lastBlockSet.map(set => set.setVal("block", "air")));
        }
    });
}
