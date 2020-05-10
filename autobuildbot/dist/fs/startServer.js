"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const path_1 = __importDefault(require("path"));
const Graph_1 = __importDefault(require("./Graph"));
const WebServer_1 = __importDefault(require("./socket/WebServer"));
async function main() {
    const graph = Graph_1.default.loadFromDumpFile(path_1.default.join(__dirname, '../src/source.graph'));
    const server = new WebServer_1.default(graph);
    await server.start();
}
exports.main = main;
//# sourceMappingURL=startServer.js.map