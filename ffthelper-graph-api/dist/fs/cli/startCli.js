"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support");
const Graph_1 = __importDefault(require("../Graph"));
const ws_1 = __importDefault(require("ws"));
const ClientRepl_1 = __importDefault(require("./ClientRepl"));
const CommandConnection_1 = __importDefault(require("../socket/CommandConnection"));
const minimist_1 = __importDefault(require("minimist"));
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
function loadFromDumpFile(filename) {
    const graph = new Graph_1.default();
    graph.loadDumpFile(filename);
    const repl = new ClientRepl_1.default(graph);
    repl.start();
}
async function main() {
    const cliArgs = minimist_1.default(process.argv.slice(2), {});
    if (cliArgs.f) {
        loadFromDumpFile(cliArgs.f);
        return;
    }
    await connectToSocketServer();
}
exports.default = main;
main()
    .catch(err => {
    process.exitCode = -1;
    console.error(err);
});
