
import WebSocket from 'ws'
import EventEmitter from 'events'
import RelationReceiver from '../RelationReceiver'
import { parseRelation } from '../parseCommand'
import IDSource from '../IDSource'

export type RespondFunc = (msg: string) => void

interface PendingQuery {
    query: string
    output: RelationReceiver
}

export default class CommandConnection {
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
                console.log('CommandConnection internal error: unrecognized reqid: ' + messageStr);
                return;
            }

            if (finish) {
                delete this.reqListeners[reqid];
                listener.finish();
                return;
            }

            if (rel === undefined) {
                console.log('CommandConnection internal error: missing "rel" field');
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

    run(query: string, output: RelationReceiver) {

        if (typeof query !== 'string')
            throw new Error("expected string for query, saw: " + query);

        if (this.ws.readyState === WebSocket.CONNECTING) {
            this.pendingForConnection.push({ query, output });
            return;
        }

        const reqid = this.requestId.take();

        this.ws.send(JSON.stringify({reqid, query}));
        this.reqListeners[reqid] = output;
    }
}

export function connectToServer(host: string): CommandConnection {

    const ws = new WebSocket('http://localhost:42940');
    const conn = new CommandConnection(ws);
    return conn;
}
