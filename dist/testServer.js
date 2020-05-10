"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const startServer_1 = __importDefault(require("./startServer"));
async function main() {
    await startServer_1.default();
}
exports.main = main;
main()
    .catch(e => {
    process.exitCode = -1;
    console.error(e);
});
//# sourceMappingURL=testServer.js.map