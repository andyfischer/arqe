"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const SocketApi_1 = __importDefault(require("../code-generation/SocketApi"));
function createServer(graph, port) {
    const server = new ws_1.default.Server({
        port,
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
    return new Promise((resolve, reject) => {
        server.on('listening', () => resolve(server));
        server.on('error', reject);
    });
}
function isAddressInUseError(e) {
    return e.code === 'EADDRINUSE';
}
async function createWebSocketServer(graph) {
    const api = new SocketApi_1.default(graph);
    let port = parseInt(api.getServerPort());
    let attempt = 0;
    while (true) {
        if (attempt > 5)
            throw new Error('passed max attempts');
        try {
            const server = await createServer(graph, port);
            console.log(`[server] Now listening on port ${port}`);
            return server;
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
    return null;
}
exports.default = createWebSocketServer;
//# sourceMappingURL=createWebSocketServer.js.map