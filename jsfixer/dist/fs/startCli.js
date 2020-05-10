"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support");
const Graph_1 = __importDefault(require("./Graph"));
const ClientRepl_1 = __importDefault(require("./ClientRepl"));
const ClientConnection_1 = require("./socket/ClientConnection");
const minimist_1 = __importDefault(require("minimist"));
async function connectToSocketServer() {
    const client = await ClientConnection_1.connectToServer();
    const repl = new ClientRepl_1.default(client);
    repl.start();
}
async function main() {
    const cliArgs = minimist_1.default(process.argv.slice(2), {
        boolean: ['generate']
    });
    let graph;
    let useRemoteServer = true;
    let startRepl = false;
    if (cliArgs.f) {
        graph = Graph_1.default.loadFromDumpFile(cliArgs.f);
        useRemoteServer = false;
        startRepl = true;
    }
    if (useRemoteServer) {
        console.log('connecting to remote server..');
        await connectToSocketServer();
    }
    if (startRepl) {
        const repl = new ClientRepl_1.default(graph);
        repl.start();
    }
}
exports.default = main;
main()
    .catch(err => {
    process.exitCode = -1;
    console.error(err.stack || err);
});
//# sourceMappingURL=startCli.js.map