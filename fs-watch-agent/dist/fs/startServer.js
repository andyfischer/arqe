"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support");
const SocketServer_1 = __importDefault(require("./socket/SocketServer"));
const Graph_1 = __importDefault(require("./Graph"));
const createWebSocketServer_1 = __importDefault(require("./socket/createWebSocketServer"));
const serverPort_1 = __importDefault(require("./socket/serverPort"));
const path_1 = __importDefault(require("path"));
async function main() {
    const wsServer = createWebSocketServer_1.default();
    console.log(`Now listening on port ${serverPort_1.default}`);
    const graph = Graph_1.default.loadFromDumpFile(path_1.default.join(__dirname, '../src/source.graph'));
    const serverSocket = new SocketServer_1.default(wsServer, graph);
    serverSocket.on('send', ({ socket, query, finish, rel, error }) => {
        if (finish)
            console.log(`[server] ${query} -> #done`);
        else
            console.log(`[server] ${query} -> ${rel || error}`);
    });
}
exports.default = main;
if (require.main === module) {
    main()
        .catch(e => {
        console.error(e);
        process.exitCode = -1;
    });
}
//# sourceMappingURL=startServer.js.map