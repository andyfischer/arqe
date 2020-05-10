"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openWebSocketClient_1 = __importDefault(require("./socket/openWebSocketClient"));
const WatchFileApi_1 = __importDefault(require("./WatchFileApi"));
const path_1 = __importDefault(require("path"));
let processClient = null;
async function watchFile(filename, callback) {
    if (processClient === null) {
        processClient = await openWebSocketClient_1.default();
    }
    filename = path_1.default.resolve(filename);
    const api = new WatchFileApi_1.default(processClient);
    let watch = await api.findFileWatch(filename);
    if (!watch) {
        watch = await api.createFileWatch(filename);
    }
    api.listenToFile(watch, (evt) => {
        console.log('saw: ' + evt.stringify());
        callback();
    });
}
exports.default = watchFile;
async function main() {
    const filename = process.argv[2];
    console.log('trying to watch: ', filename);
    watchFile(filename, () => {
        console.log('saw change');
    })
        .catch(console.error);
}
if (require.main === module) {
    main()
        .catch(console.error);
}
//# sourceMappingURL=watchFile.js.map