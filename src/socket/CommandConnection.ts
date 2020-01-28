
import WebSocket from 'ws'
import EventEmitter from 'events'
import { RespondFunc } from '../Graph'

import ResponseAccumulator from '../ResponseAccumulator'

interface Listener {
    receive: (msg: string) => void
    streaming?: boolean
}

export default class CommandConnection {
    ws: WebSocket
    nextReqId: number = 1
    connectionId: string

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

            listener.receive(msg);

            if (msg === '#start')
                listener.streaming = true;

            if (msg === '#done')
                listener.streaming = false;

            if (!listener.streaming) {
                delete this.reqListeners[reqid];
            }
        });
    }

    async setup() {
    }

    async close() {
        this.ws.terminate();
    }

    async run(command: string, receive: RespondFunc) {

        const reqid = this.nextReqId;
        this.nextReqId += 1

        this.ws.send(JSON.stringify({reqid, command}));
        this.reqListeners[reqid] = {
            receive
        }
    }

    async runGetFullResponse(command: string): Promise<string | string[]> {
        const accumulator = new ResponseAccumulator();
        this.run(command, accumulator.receiveCallback());
        return await accumulator.waitUntilDone()
    }
}
