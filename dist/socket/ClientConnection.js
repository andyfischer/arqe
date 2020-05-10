"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const parseCommand_1 = require("../parseCommand");
const IDSource_1 = __importDefault(require("../utils/IDSource"));
const receivers_1 = require("../receivers");
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function tryToConnect(url) {
    const ws = new ws_1.default(url);
    return new Promise((resolve, reject) => {
        const open = () => {
            ws.removeListener('open', open);
            ws.removeListener('error', error);
            resolve({ ws });
        };
        const error = (e) => {
            resolve({ error: e });
        };
        ws.on('open', open);
        ws.on('error', error);
    });
}
class ClientConnection {
    constructor(url) {
        this.requestId = new IDSource_1.default();
        this.autoReconnect = false;
        this.pendingForConnection = [];
        this.reqListeners = {};
        this.connectAttemptInProgress = false;
        this.maxReconnectAttempts = 10;
        this.shouldLogReconnect = false;
        if (!url)
            throw new Error('missing url value');
        this.url = url;
    }
    async openSocket() {
        if (this.connectAttemptInProgress)
            return;
        this.connectAttemptInProgress = true;
        let reconnectAttempts = 0;
        while (true) {
            const result = await tryToConnect(this.url);
            if (result.error) {
                if (reconnectAttempts >= this.maxReconnectAttempts) {
                    this.connectAttemptInProgress = false;
                    throw new Error(`Couldn't connect after ${this.maxReconnectAttempts} attempts`);
                }
                reconnectAttempts += 1;
                await delay(1000);
                continue;
            }
            this.ws = result.ws;
            this.connectAttemptInProgress = false;
            this.setupWebsocket();
            if (this.shouldLogReconnect) {
                console.log('websocket has reconnected');
                this.shouldLogReconnect = false;
            }
            return;
        }
    }
    async start() {
        if (this.connectAttemptInProgress)
            throw new Error('socket is already connecting');
        await this.openSocket();
    }
    setupWebsocket() {
        this.ws.on('message', messageStr => {
            const { reqid, rel, finish } = JSON.parse(messageStr);
            const listener = this.reqListeners[reqid];
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
            listener.relation(parseCommand_1.parseRelation(rel));
        });
        this.ws.on('close', () => {
            if (this.autoReconnect) {
                console.log('websocket closed, trying to reconnect');
                this.shouldLogReconnect = true;
                this.openSocket()
                    .catch(console.error);
            }
        });
        this.ws.on('error', (e) => {
            console.error(e);
        });
    }
    async close() {
        this.autoReconnect = false;
        this.ws.terminate();
    }
    run(commandStr, output) {
        if (typeof commandStr !== 'string')
            throw new Error("expected string for command, saw: " + commandStr);
        if (!output)
            output = receivers_1.fallbackReceiver(commandStr);
        if (this.ws.readyState === ws_1.default.CONNECTING) {
            console.log('command is pending: ', commandStr);
            this.pendingForConnection.push({ query: commandStr, output });
            return;
        }
        const reqid = this.requestId.take();
        this.ws.send(JSON.stringify({ reqid, query: commandStr }));
        this.reqListeners[reqid] = output;
    }
    runSync(commandStr) {
        throw new Error(`ClientConnection doesn't support runSync`);
    }
}
exports.default = ClientConnection;
async function connectToServer() {
    const port = process.env.PORT || '42940';
    const conn = new ClientConnection(`http://localhost:${port}/ws`);
    await conn.start();
    return conn;
}
exports.connectToServer = connectToServer;
//# sourceMappingURL=ClientConnection.js.map