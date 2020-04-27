
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

export default class ClientConnection implements GraphLike {
    ws: WebSocket
    requestId: IDSource = new IDSource()
    connectionId: string

    pendingForConnection: PendingQuery[] = []
    reqListeners: { [id: string]: RelationReceiver } = {}

    constructor(ws: WebSocket) {
        this.ws = ws;

        ws.on('message', messageStr => {

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

        ws.on('open', str => {
            const pending = this.pendingForConnection;
            this.pendingForConnection = [];

            for (const { query, output } of pending) {
                this.run(query, output)
            }
        });
    }

    async close() {
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

export function connectToServer(host: string): ClientConnection {

    const ws = new WebSocket('http://localhost:42940');
    const conn = new ClientConnection(ws);
    return conn;
}
