"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openWebSocketClient_1 = __importDefault(require("./fs/socket/openWebSocketClient"));
async function main() {
    const conn = await openWebSocketClient_1.default();
    const filename = process.argv[2];
    console.log('watching filename: ', filename);
    conn.run(`get file-watch/* filename/${filename}`, {
        relation(rel) { console.log(rel.stringify()); },
        isDone() { return false; },
        finish() { }
    });
}
main()
    .catch(console.error);
//# sourceMappingURL=sampleClient.js.map