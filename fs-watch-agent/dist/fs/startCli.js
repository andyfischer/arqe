"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support");
const Graph_1 = __importDefault(require("./Graph"));
const ws_1 = __importDefault(require("ws"));
const ClientRepl_1 = __importDefault(require("./ClientRepl"));
const CommandConnection_1 = __importDefault(require("./socket/CommandConnection"));
const minimist_1 = __importDefault(require("minimist"));
const CodeGenerator_1 = require("./CodeGenerator");
async function connectToSocketServer() {
    const ws = new ws_1.default('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });
    ws.on('close', () => {
        console.log('Disconnected from server');
        process.exit();
    });
    const commandConnection = new CommandConnection_1.default(ws);
    const repl = new ClientRepl_1.default(commandConnection);
    repl.start();
}
async function main() {
    const cliArgs = minimist_1.default(process.argv.slice(2), {
        boolean: ['generate']
    });
    let graph;
    let useRemoteServer = true;
    let startRepl = false;
    if (cliArgs.generate) {
        if (!cliArgs.f)
            throw new Error("should use -f with --generate");
        CodeGenerator_1.runCodeGenerator(cliArgs.f);
        return;
    }
    if (cliArgs.f) {
        graph = Graph_1.default.loadFromDumpFile(cliArgs.f);
        useRemoteServer = false;
        startRepl = true;
    }
    if (useRemoteServer) {
        console.log('connecting to remove server..');
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
    console.error(err);
});
//# sourceMappingURL=startCli.js.map