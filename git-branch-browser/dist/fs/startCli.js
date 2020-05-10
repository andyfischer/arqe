"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const Graph_1 = __importDefault(require("./Graph"));
const GraphRepl_1 = __importDefault(require("./GraphRepl"));
const repl_1 = __importDefault(require("repl"));
const ClientConnection_1 = require("./socket/ClientConnection");
const minimist_1 = __importDefault(require("minimist"));
async function main() {
    const cliArgs = minimist_1.default(process.argv.slice(2), {
        boolean: ['generate']
    });
    let graph;
    let useRemoteServer = true;
    if (cliArgs.f) {
        graph = Graph_1.default.loadFromDumpFile(cliArgs.f);
        useRemoteServer = false;
    }
    if (useRemoteServer) {
        console.log('connecting to remote server..');
        graph = await ClientConnection_1.connectToServer();
    }
    const graphRepl = new GraphRepl_1.default(graph);
    const repl = repl_1.default.start({
        prompt: '~ ',
        eval: line => graphRepl.eval(line, () => {
            repl.displayPrompt();
        })
    });
    repl.on('exit', () => {
        process.exit(0);
    });
}
exports.default = main;
main()
    .catch(err => {
    process.exitCode = -1;
    console.error(err.stack || err);
});
//# sourceMappingURL=startCli.js.map