
import WebSocket from 'ws'

export default class CommandConnection {

    ws: WebSocket
    nextReqId: number = 1

    reqListeners = {}

    constructor(ws: WebSocket) {
        this.ws = ws;

        ws.on('message', str => {
            const { reqid, result } = JSON.parse(str);
            this.reqListeners[reqid](result);
            delete this.reqListeners[reqid];
        });
    }

    async run(command: string) {
        const reqid = this.nextReqId;
        this.nextReqId += 1
        this.ws.send(JSON.stringify({reqid, command}));
        return new Promise((resolve, reject) => {
            this.reqListeners[reqid] = resolve;
        });
    }
}
