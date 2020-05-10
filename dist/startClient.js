"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support");
const ws_1 = __importDefault(require("ws"));
const CommandConnection_1 = __importDefault(require("./socket/CommandConnection"));
const test_graphdb_1 = require("./test-graphdb");
async function main() {
    const ws = new ws_1.default('http://localhost:42940');
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });
    console.log('client: Connected to server');
    const commandConnection = new CommandConnection_1.default(ws);
    await test_graphdb_1.mainFunctionalTests(commandConnection);
}
exports.default = main;
main()
    .catch(err => {
    process.exitCode = -1;
    console.error(err);
});
//# sourceMappingURL=startClient.js.map