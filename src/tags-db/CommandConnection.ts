
import WebSocket from 'ws'

interface Listener {
    receivePart?: (msg: string) => void
    receiveEnd?: () => void
}

export default class CommandConnection {
    ws: WebSocket
    nextReqId: number = 1

    reqListeners: { [id: string]: Listener } = {}

    constructor(ws: WebSocket) {
        this.ws = ws;

        ws.on('message', str => {
            const { reqid, result, more } = JSON.parse(str);

            const listener = this.reqListeners[reqid]

            if (!listener) {
                console.log('CommandConnection internal error: unrecognized reqid: ' + str);
                return;
            }

            if (result)
                listener.receivePart(result);

            if (!more) {
                listener.receiveEnd();
                delete this.reqListeners[reqid];
            }
        });
    }

    close() {
        this.ws.terminate();
    }

    async _runWithListener(command: string, listener: Listener) {
        const reqid = this.nextReqId;
        this.nextReqId += 1

        this.ws.send(JSON.stringify({reqid, command}));
        this.reqListeners[reqid] = listener;
    }

    async run(command: string): Promise<string> {

        const lines = []

        return new Promise((resolve, reject) => {
            this._runWithListener(command, {
                receivePart: (msg) => { lines.push(msg) },
                receiveEnd: () => resolve(lines.join('\n'))
            });
        });
    }
}
