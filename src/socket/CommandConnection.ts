
import WebSocket from 'ws'
import EventEmitter from 'events'
import { RespondFunc } from '../Graph'


interface Listener {
    respond: (msg: string) => void
    streaming?: boolean
}

interface PendingQuery {
    query: string
    respond: RespondFunc
}

export default class CommandConnection {
    ws: WebSocket
    nextReqId: number = 1
    connectionId: string

    pendingForConnection: PendingQuery[] = []
    reqListeners: { [id: string]: Listener } = {}

    constructor(ws: WebSocket) {
        this.ws = ws;

        ws.on('message', str => {

            const { reqid, msg } = JSON.parse(str);

            if (msg === undefined) {
                console.log('CommandConnection internal error: missing "msg" field');
            }
            
            const listener = this.reqListeners[reqid]

            if (!listener) {
                console.log('CommandConnection internal error: unrecognized reqid: ' + str);
                return;
            }

            listener.respond(msg);

            if (msg === '#start')
                listener.streaming = true;

            if (msg === '#done')
                listener.streaming = false;

            if (!listener.streaming) {
                delete this.reqListeners[reqid];
            }
        });

        ws.on('open', str => {
            const pending = this.pendingForConnection;
            this.pendingForConnection = [];

            for (const { query, respond } of pending) {
                this.run(query, respond)
                .catch(console.error);
            }
        });
    }

    async close() {
        this.ws.terminate();
    }

    async run(query: string, respond: RespondFunc) {

        if (typeof query !== 'string')
            throw new Error("expected string for query, got: " + query);

        if (this.ws.readyState === WebSocket.CONNECTING) {
            this.pendingForConnection.push({ query, respond });
            return;
        }

        const reqid = this.nextReqId;
        this.nextReqId += 1

        this.ws.send(JSON.stringify({reqid, query}));
        this.reqListeners[reqid] = {
            respond
        }
    }
}

export function connectToServer(host: string): CommandConnection {

    const ws = new WebSocket('http://localhost:42940');
    const conn = new CommandConnection(ws);
    return conn;
}
