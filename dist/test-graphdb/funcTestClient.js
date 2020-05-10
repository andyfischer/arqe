"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const CommandConnection_1 = __importDefault(require("../socket/CommandConnection"));
const mainFunctionalTests_1 = __importDefault(require("./mainFunctionalTests"));
async function main() {
    const ws = new ws_1.default('http://localhost:42940');
    const commandConnection = new CommandConnection_1.default(ws);
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });
    await commandConnection.setup();
    console.log('Running functional tests..');
    await mainFunctionalTests_1.default(commandConnection);
    commandConnection.close();
}
exports.default = main;
main()
    .catch(err => {
    process.exitCode = -1;
    console.error(err);
});
//# sourceMappingURL=funcTestClient.js.map