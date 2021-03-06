
import WebSocket from '../../platform/ws'
import EventEmitter from 'events'
import Stream from '../../Stream'
import IDSource from '../../utils/IDSource'
import { receiveToTupleList, fallbackReceiver } from '../../receiveUtils'
import parseTuple from '../../stringFormat/parseTuple'
import { toQuery, QueryLike } from '../../coerce'

export type RespondFunc = (msg: string) => void

interface PendingQuery {
    query: string
    output: Stream
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
            delete ws.onopen;
            delete ws.onerror;
            resolve({ws});
        }

        const error = (e) => {
            resolve({ error: e });
        }

        ws.onopen = open;
        ws.onerror = error;
    });
}

export default class ClientConnection {
    url: string
    ws: WebSocket
    requestId: IDSource = new IDSource()
    connectionId: string
    autoReconnect = false

    pendingForConnection: PendingQuery[] = []
    reqListeners: { [id: string]: Stream } = {}

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
        this.ws.onmessage = event => {

            const messageStr = event.data;
            const { reqid, rel, finish } = JSON.parse(messageStr);

            const listener = this.reqListeners[reqid]
            if (!listener) {
                console.log('ClientConnection protocol error: unrecognized reqid: ' + messageStr);
                return;
            }

            if (finish) {
                delete this.reqListeners[reqid];
                listener.done();
                return;
            }

            if (rel === undefined) {
                console.log('ClientConnection protocol error: missing "rel" field, messageStr = ' + messageStr);
                return;
            }
            
            listener.next(parseTuple(rel));
        }

        this.ws.onclose = () => {
            if (this.autoReconnect) {
                console.log('websocket closed, trying to reconnect');

                this.shouldLogReconnect = true;

                this.openSocket()
                .catch(console.error);
            }
        }

        this.ws.onerror = (e) => {
            console.error(e);
        }
    }

    async close() {
        this.autoReconnect = false;
        this.ws.close();
    }

    run(queryLike: QueryLike, output?: Stream) {

        const query = toQuery(queryLike);

        if (!output)
            output = fallbackReceiver(query);

        if (this.ws.readyState === WebSocket.CONNECTING) {
            console.log('command is pending: ', query.stringify());
            this.pendingForConnection.push({ query: query.stringify(), output });
            return;
        }

        const reqid = this.requestId.take();

        this.ws.send(JSON.stringify({reqid, query: query.stringify()}));
        this.reqListeners[reqid] = output;
    }

    runSync(queryLike: QueryLike): any {
        throw new Error(`ClientConnection doesn't support runSync`);
    }
}

export async function connectToServer(port: string|number): Promise<ClientConnection> {

    const conn = new ClientConnection(`ws://localhost:${port}/ws`);
    await conn.start();
    return conn;
}
