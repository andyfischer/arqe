"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const SocketApi_1 = __importDefault(require("../code-generation/SocketApi"));
const Connection_1 = __importDefault(require("./Connection"));
const events_1 = __importDefault(require("events"));
function isAddressInUseError(e) {
    return e.code === 'EADDRINUSE';
}
function getData(stream, callback) {
    let body = '';
    stream.on('data', data => { body += data.toString(); });
    stream.on('end', () => callback(body));
}
class WebServer extends events_1.default {
    constructor(graph) {
        super();
        this.graph = graph;
        this.api = new SocketApi_1.default(this.graph);
    }
    handlePostCommand(query, res) {
        const id = this.api.createUniqueConnection();
        res.statusCode = 200;
        this.graph.run(query, {
            relation: (rel) => {
                res.write(rel.stringify() + '\n');
                this.emit('send', { query, rel });
            },
            finish: () => {
                res.end();
                this.emit('send', { query, finish: true });
            }
        });
    }
    async createHttpServer(port) {
        const httpServer = http_1.default.createServer((req, res) => {
            if (req.url === '/run') {
                if (req.method === 'POST') {
                    getData(req, (query) => {
                        this.handlePostCommand(query, res);
                    });
                    return;
                }
            }
            res.statusCode = 404;
            res.end('Not found');
        });
        httpServer.listen(port);
        await new Promise((resolve, reject) => {
            httpServer.on('listening', resolve);
            httpServer.on('error', reject);
        });
        this.httpServer = httpServer;
    }
    async createWsServer() {
        const wsServer = new ws_1.default.Server({
            server: this.httpServer,
            path: '/ws',
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 10,
                concurrencyLimit: 10,
                threshold: 1024
            }
        });
        wsServer.on('error', err => console.error('wsserver error: ' + err));
        wsServer.on('connection', (ws) => {
            const socketConnection = new Connection_1.default(this.graph, ws);
            socketConnection.on('send', data => {
                this.emit('send', { socket: this, ...data });
            });
        });
        this.wsServer = wsServer;
    }
    async createAndListen() {
        const api = new SocketApi_1.default(this.graph);
        let port = parseInt(api.getServerPort());
        let attempt = 0;
        while (true) {
            if (attempt > 5)
                throw new Error('passed max attempts');
            try {
                await this.createHttpServer(port);
                await this.createWsServer();
                console.log(`[server] Now listening on port ${port}`);
                this.port = port;
                return;
            }
            catch (e) {
                if (isAddressInUseError(e)) {
                    console.log(`[server] port ${port} is already in use, trying next port..`);
                    attempt += 1;
                    port += 1;
                    continue;
                }
                throw e;
            }
        }
    }
    async start() {
        await this.createAndListen();
    }
}
exports.default = WebServer;
//# sourceMappingURL=WebServer.js.map