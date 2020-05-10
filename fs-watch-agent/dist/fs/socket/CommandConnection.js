"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const parseCommand_1 = require("../parseCommand");
const IDSource_1 = __importDefault(require("../utils/IDSource"));
const receivers_1 = require("../receivers");
class CommandConnection {
    constructor(ws) {
        this.requestId = new IDSource_1.default();
        this.pendingForConnection = [];
        this.reqListeners = {};
        this.ws = ws;
        ws.on('message', messageStr => {
            const { reqid, rel, finish } = JSON.parse(messageStr);
            const listener = this.reqListeners[reqid];
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
            listener.relation(parseCommand_1.parseRelation(rel));
        });
        ws.on('open', str => {
            const pending = this.pendingForConnection;
            this.pendingForConnection = [];
            for (const { query, output } of pending) {
                this.run(query, output);
            }
        });
    }
    async close() {
        this.ws.terminate();
    }
    run(commandStr, output) {
        if (typeof commandStr !== 'string')
            throw new Error("expected string for command, saw: " + commandStr);
        if (!output)
            output = receivers_1.fallbackReceiver(commandStr);
        if (this.ws.readyState === ws_1.default.CONNECTING) {
            this.pendingForConnection.push({ query: commandStr, output });
            return;
        }
        const reqid = this.requestId.take();
        this.ws.send(JSON.stringify({ reqid, query: commandStr }));
        this.reqListeners[reqid] = output;
    }
    runSync(commandStr) {
        throw new Error(`CommandConnection doesn't support runSync`);
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