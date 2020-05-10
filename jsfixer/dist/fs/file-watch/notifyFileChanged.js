"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const WatchFileApi_1 = __importDefault(require("./WatchFileApi"));
const runStandardProcess_1 = __importDefault(require("../toollib/runStandardProcess"));
const getProcessClient_1 = __importDefault(require("../toollib/getProcessClient"));
async function notifyFileChanged(filename) {
    const graph = await getProcessClient_1.default();
    filename = path_1.default.resolve(filename);
    const api = new WatchFileApi_1.default(graph);
    if ((await api.findWatchesForFilename(filename)).length === 0)
        await api.createWatch(filename);
    else
        await api.incrementVersion(filename);
}
exports.notifyFileChanged = notifyFileChanged;
function main() {
    setTimeout(() => {
        console.log('timed out');
        process.exit(-1);
    }, 250);
    runStandardProcess_1.default(async (graph) => {
        let filename = process.argv[2];
        if (!filename) {
            console.log('Expected filename argument');
            process.exitCode = -1;
            return;
        }
        await notifyFileChanged(filename);
    });
}
exports.main = main;
//# sourceMappingURL=notifyFileChanged.js.map