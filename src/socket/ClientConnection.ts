
import WebSocket from 'ws'
import EventEmitter from 'events'
import RelationReceiver from '../RelationReceiver'
import { parseRelation } from '../parseCommand'
import IDSource from '../utils/IDSource'
import GraphLike from '../GraphLike'
import { receiveToRelationList, fallbackReceiver } from '../receivers'

export type RespondFunc = (msg: string) => void

interface PendingQuery {
    query: string
    output: RelationReceiver
}

type ConnectError = {
    error: Error
}

type ConnectSuccess = {
    ws: WebSocket
}

type ConnectResult = ConnectSuccess | ConnectError

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function tryToConnect(url: string): Promise<ConnectResult> {

    const ws = new WebSocket(url);

    // Wait for 'open' event.
    return new Promise((resolve, reject) => {
        const open = () => {
            ws.removeListener('open', open);
            ws.removeListener('error', error);
            resolve({ws});
        }

        const error = (e) => {
            resolve({ error: e });
        }

        ws.on('open', open);
        ws.on('error', error);
    });
}

export default class ClientConnection implements GraphLike {
    url: string
    ws: WebSocket
    requestId: IDSource = new IDSource()
    connectionId: string
    autoReconnect = false

    pendingForConnection: PendingQuery[] = []
    reqListeners: { [id: string]: RelationReceiver } = {}

    connectAttemptInProgress = false;
    maxReconnectAttempts = 10;

    shouldLogReconnect = false

    constructor(url: string) {
        if (!url)
            throw new Error('missing url value');

        this.url = url;
    }

    async openSocket() {

        if (this.connectAttemptInProgress)
            return;

        this.connectAttemptInProgress = true;

        let reconnectAttempts = 0;

        while (true) {

            const result = await tryToConnect(this.url);

            if ((result as ConnectError).error) {
                if (reconnectAttempts >= this.maxReconnectAttempts) {
                    this.connectAttemptInProgress = false;
                    throw new Error(`Couldn't connect after ${this.maxReconnectAttempts} attempts`);
                }

                reconnectAttempts += 1;
                await delay(1000);
                continue;
            }

            this.ws = (result as ConnectSuccess).ws;
            this.connectAttemptInProgress = false;
            this.setupWebsocket();

            if (this.shouldLogReconnect) {
                console.log('websocket has reconnected');
                this.shouldLogReconnect = false;
            }

            return;
        }
    }

    async start() {
        if (this.connectAttemptInProgress)
            throw new Error('socket is already connecting');

        await this.openSocket();
    }

    setupWebsocket() {
        this.ws.on('message', messageStr => {

            const { reqid, rel, finish } = JSON.parse(messageStr);

            const listener = this.reqListeners[reqid]
            if (!listener) {
                console.log('ClientConnection protocol error: unrecognized reqid: ' + messageStr);
                return;
            }

            if (finish) {
                delete this.reqListeners[reqid];
                listener.finish();
                return;
            }

            if (rel === undefined) {
                console.log('ClientConnection protocol error: missing "rel" field, messageStr = ' + messageStr);
                return;
            }
            
            listener.relation(parseRelation(rel));
        });

        this.ws.on('close', () => {
            if (this.autoReconnect) {
                console.log('websocket closed, trying to reconnect');

                this.shouldLogReconnect = true;

                this.openSocket()
                .catch(console.error);
            }
        });

        this.ws.on('error', (e) => {
            console.error(e);
        });
    }

    async close() {
        this.autoReconnect = false;
        this.ws.terminate();
    }

    run(commandStr: string, output?: RelationReceiver) {

        if (typeof commandStr !== 'string')
            throw new Error("expected string for command, saw: " + commandStr);

        if (!output)
            output = fallbackReceiver(commandStr);

        if (this.ws.readyState === WebSocket.CONNECTING) {
            this.pendingForConnection.push({ query: commandStr, output });
            return;
        }

        const reqid = this.requestId.take();

        this.ws.send(JSON.stringify({reqid, query: commandStr}));
        this.reqListeners[reqid] = output;
    }

    runSync(commandStr: string): any {
        throw new Error(`ClientConnection doesn't support runSync`);
    }
}

export async function connectToServer(): Promise<ClientConnection> {

    const port = process.env.PORT || '42940'
    const conn = new ClientConnection(`http://localhost:${port}/ws`);
    await conn.start();
    return conn;
}
