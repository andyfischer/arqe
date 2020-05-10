"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support");
const SocketServer_1 = __importDefault(require("./socket/SocketServer"));
const Graph_1 = __importDefault(require("./Graph"));
const bootstrapGraph_1 = __importDefault(require("./bootstrapGraph"));
const createWebSocketServer_1 = __importDefault(require("./socket/createWebSocketServer"));
const defaultServerPort_1 = __importDefault(require("./socket/defaultServerPort"));
async function main() {
    const wsServer = createWebSocketServer_1.default();
    console.log(`Now listening on port ${defaultServerPort_1.default}`);
    const graph = new Graph_1.default();
    bootstrapGraph_1.default(graph);
    const serverSocket = new SocketServer_1.default(wsServer, graph);
    serverSocket.on('send', ({ socket, query, response, error }) => {
        console.log(`  ${query} -> ${response || error}`);
    });
}
exports.default = main;
main()
    .catch(err => {
    process.exitCode = -1;
    console.error(err);
});
