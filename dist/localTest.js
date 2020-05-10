"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const startServer_1 = __importDefault(require("./startServer"));
const watchFile_1 = __importDefault(require("./watchFile"));
async function main() {
    await startServer_1.default();
    await watchFile_1.default('test', () => {
        console.log(`file 'test' changed`);
    });
}
main()
    .catch(e => {
    process.exitCode = -1;
    console.error(e);
});
//# sourceMappingURL=localTest.js.map