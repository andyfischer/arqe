"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProcessClient_1 = __importDefault(require("./toollib/getProcessClient"));
const path_1 = __importDefault(require("path"));
const WatchFileApi_1 = __importDefault(require("./file-watch/WatchFileApi"));
async function main() {
    let filename = process.argv[2];
    filename = path_1.default.resolve(filename);
    const graph = await getProcessClient_1.default();
    const api = new WatchFileApi_1.default(graph);
    await api.postChange(filename);
    graph.close();
}
if (require.main === module) {
    main()
        .catch(e => {
        process.exitCode = -1;
        console.error(e);
    });
}
//# sourceMappingURL=notifyFileChanged.js.map