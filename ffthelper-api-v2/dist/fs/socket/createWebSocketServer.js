"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const serverPort_1 = __importDefault(require("./serverPort"));
function createWebSocketServer() {
    return new ws_1.default.Server({
        port: serverPort_1.default,
        perMessageDeflate: {
            zlibDeflateOptions: {
                // See zlib defaults.
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            // Other options settable:
            clientNoContextTakeover: true,
            serverNoContextTakeover: true,
            serverMaxWindowBits: 10,
            // Below options specified as default values.
            concurrencyLimit: 10,
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
        }
    });
}
exports.default = createWebSocketServer;
