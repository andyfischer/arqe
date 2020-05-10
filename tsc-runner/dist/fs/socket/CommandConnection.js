"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class CommandConnection {
    constructor(ws) {
        this.nextReqId = 1;
        this.pendingForConnection = [];
        this.reqListeners = {};
        this.ws = ws;
        ws.on('message', str => {
            const { reqid, msg } = JSON.parse(str);
            if (msg === undefined) {
                console.log('CommandConnection internal error: missing "msg" field');
            }
            const listener = this.reqListeners[reqid];
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
    async run(query, respond) {
        if (typeof query !== 'string')
            throw new Error("expected string for query, got: " + query);
        if (this.ws.readyState === ws_1.default.CONNECTING) {
            this.pendingForConnection.push({ query, respond });
            return;
        }
        const reqid = this.nextReqId;
        this.nextReqId += 1;
        this.ws.send(JSON.stringify({ reqid, query }));
        this.reqListeners[reqid] = {
            respond
        };
    }
}
exports.default = CommandConnection;
function connectToServer(host) {
    const ws = new ws_1.default('http://localhost:42940');
    const conn = new CommandConnection(ws);
    return conn;
}
exports.connectToServer = connectToServer;
//# sourceMappingURL=CommandConnection.js.map