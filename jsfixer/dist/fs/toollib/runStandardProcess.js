"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProcessClient_1 = __importDefault(require("../toollib/getProcessClient"));
async function runStandardProcess(handler) {
    let graph;
    try {
        graph = await getProcessClient_1.default();
    }
    catch (e) {
        console.error('Failed to connect to server: ' + e);
        process.exitCode = -1;
        return;
    }
    try {
        await handler(graph);
    }
    catch (e) {
        console.error('Unhandled exception in runStandardProcess');
        console.error(e);
        process.exitCode = -1;
    }
    graph.close();
}
exports.default = runStandardProcess;
//# sourceMappingURL=runStandardProcess.js.map