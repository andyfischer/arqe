"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const WatchFileApi_1 = __importDefault(require("./WatchFileApi"));
const getProcessClient_1 = __importDefault(require("../toollib/getProcessClient"));
const runStandardProcess_1 = __importDefault(require("../toollib/runStandardProcess"));
async function watchFile(filename, callback) {
    const graph = await getProcessClient_1.default();
    filename = path_1.default.resolve(filename);
    const api = new WatchFileApi_1.default(graph);
    let watch = await api.findFileWatch(filename);
    if (!watch) {
        watch = await api.createWatch(filename);
    }
    api.listenToFile(watch, callback);
}
exports.default = watchFile;
async function main() {
    runStandardProcess_1.default(async (graph) => {
        const filename = process.argv[2];
        watchFile(filename, (version) => {
            console.log(`file ${filename} changed: ` + version);
        })
            .catch(console.error);
        await new Promise((resolve, reject) => { });
    });
}
exports.main = main;
//# sourceMappingURL=watchFile.js.map