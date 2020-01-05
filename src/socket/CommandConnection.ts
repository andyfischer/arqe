
import WebSocket from 'ws'
import EventEmitter from 'events'

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
            const listener = this.reqListeners[reqid]

            if (!listener) {
                console.log('CommandConnection internal error: unrecognized reqid: ' + str);
                return;
            }

            listener.receive(msg);

            if (msg === '#started')
                listener.streaming = true;

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

    async run(command: string, receive: (msg: string) => void) {

        const reqid = this.nextReqId;
        this.nextReqId += 1

        this.ws.send(JSON.stringify({reqid, command}));
        this.reqListeners[reqid] = {
            receive
        }
    }

    async runGetFullResponse(command: string): Promise<string | string[]> {
        const accumulator = new ResponseAccumulator();
        return await accumulator.waitUntilDone()
    }
}
