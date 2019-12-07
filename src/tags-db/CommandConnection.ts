
import WebSocket from 'ws'

export default class CommandConnection {

    ws: WebSocket
    nextReqId: number = 1

    reqListeners = {}

    constructor(ws: WebSocket) {
        this.ws = ws;

        ws.on('message', str => {
            const { reqid, result } = JSON.parse(str);

            const listener = this.reqListeners[reqid]

            if (!listener) {
                console.log('CommandConnection internal error: unrecognized reqid: ' + str);
                return;
            }

            listener(result);
            delete this.reqListeners[reqid];
        });
    }

    close() {
        this.ws.terminate();
    }

    async run(command: string): Promise<string> {

        if (command.indexOf('/null') !== -1)
            throw new Error("Found /null in command: " + command);

        const reqid = this.nextReqId;
        this.nextReqId += 1
        this.ws.send(JSON.stringify({reqid, command}));
        return new Promise((resolve, reject) => {
            this.reqListeners[reqid] = resolve;
        });
    }
}
