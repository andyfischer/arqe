"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SocketApi_1 = __importDefault(require("../code-generation/SocketApi"));
async function createWebSocketServer(graph) {
    const api = new SocketApi_1.default(graph);
    let attempt = 0;
    let port = api.getServerPort();
    while (true) {
        if (attempt > 5)
            throw new Error('passed max attempts');
        try {
            const server = await createServer(graph, api, port);
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