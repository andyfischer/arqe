"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const logError_1 = __importDefault(require("../logError"));
const events_1 = __importDefault(require("events"));
const SocketApi_1 = __importDefault(require("../code-generation/SocketApi"));
class Connection extends events_1.default {
    constructor(graph, ws) {
        super();
        this.graph = graph;
        this.ws = ws;
        this.api = new SocketApi_1.default(graph);
        const id = this.api.createUniqueConnection();
        console.log(`[${id} connected]`);
        ws.on('message', async (message) => {
            this.emit('received', message);
            const data = JSON.parse(message);
            const { reqid, query } = data;
            let sentFinish = false;
            if (!query) {
                this.send(null, { reqid, err: "#error protocal error, missing 'query'" });
                console.log(`received malformed request (missing 'query'): ${query}`);
                return;
            }
            try {
                console.log(`[${id}] ${query}`);
                this.graph.run(query, {
                    relation: (rel) => {
                        this.send(query, { reqid, rel: rel.stringifyRelation() });
                    },
                    finish: () => {
                        if (sentFinish)
                            throw new Error(`saw duplicate 'finish' event`);
                        this.send(query, { reqid, finish: true });
                        sentFinish = true;
                    }
                });
            }
            catch (err) {
                logError_1.default(err);
                this.send(query, { reqid, internalError: true, err });
            }
        });
        ws.on('close', async () => {
            this.api.deleteConnection(id);
            console.log(`[${id} closed]`);
        });
    }
    send(query, data) {
        this.emit('send', { query, rel: data.rel, finish: data.finish, error: data.err });
        this.ws.send(JSON.stringify(data));
    }
}
class SockerServer extends events_1.default {
    constructor(wss, graph) {
        super();
        this.graph = graph || new Graph_1.default();
        this.wss = wss;
        this.wss.on('connection', (ws) => {
            const socketConnection = new Connection(this.graph, ws);
            socketConnection.on('send', data => {
                this.emit('send', { socket: this, ...data });
            });
        });
    }
}
exports.default = SockerServer;
//# sourceMappingURL=SocketServer.js.map