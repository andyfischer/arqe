"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const CommandConnection_1 = __importDefault(require("./CommandConnection"));
const defaultUrl = 'http://localhost:42940';
async function openWebSocketClient() {
    const ws = new ws_1.default(defaultUrl);
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
    });
    ws.on('close', () => {
        console.log('Disconnected from server');
    });
    const commandConnection = new CommandConnection_1.default(ws);
    return commandConnection;
}
exports.default = openWebSocketClient;
//# sourceMappingURL=openWebSocketClient.js.map