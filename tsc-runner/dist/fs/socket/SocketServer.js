"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const GraphContext_1 = __importDefault(require("../GraphContext"));
const GraphORM_1 = require("../GraphORM");
const logError_1 = __importDefault(require("../logError"));
const events_1 = __importDefault(require("events"));
class Connection extends events_1.default {
    constructor(graph, ws) {
        super();
        this.graph = graph;
        this.ws = ws;
        const id = GraphORM_1.createUniqueEntity(graph, 'connection');
        this.graphContext = new GraphContext_1.default(this.graph);
        this.graphContext.addOptionalContextTag({ tagType: 'connection', tagValue: id });
        ws.on('message', async (message) => {
            this.emit('received', message);
            const data = JSON.parse(message);
            const { reqid, query } = data;
            if (!query) {
                this.send(null, { reqid, err: "#error protocal error, missing 'query'" });
                return;
            }
            try {
                await this.handleCommand(reqid, query);
            }
            catch (err) {
                logError_1.default(err);
                this.send(query, { reqid, internalError: true, err });
            }
        });
        ws.on('close', async () => {
            this.graph.run(`delete connection/${id} *`);
            console.log(`server: closed connection/${id}`);
        });
    }
    send(query, data) {
        this.emit('send', { query, response: data.msg, error: data.err });
        this.ws.send(JSON.stringify(data));
    }
    async handleCommand(reqid, query) {
        this.graphContext.run(query, (msg) => {
            this.send(query, { reqid, msg });
        });
    }
}
class ServerSocket extends events_1.default {
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
exports.default = ServerSocket;
//# sourceMappingURL=SocketServer.js.map