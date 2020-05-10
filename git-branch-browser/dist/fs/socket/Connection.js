"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SocketApi_1 = __importDefault(require("../code-generation/SocketApi"));
const events_1 = __importDefault(require("events"));
const logError_1 = __importDefault(require("../logError"));
class Connection extends events_1.default {
    send(query, data) {
        this.emit('send', { query, rel: data.rel, finish: data.finish, error: data.err });
        this.ws.send(JSON.stringify(data));
    }
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
}
exports.default = Connection;
//# sourceMappingURL=Connection.js.map