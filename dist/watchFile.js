"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WatchFileApi_1 = __importDefault(require("./WatchFileApi"));
const path_1 = __importDefault(require("path"));
const getProcessClient_1 = __importDefault(require("./toollib/getProcessClient"));
async function watchFile(filename, callback) {
    filename = path_1.default.resolve(filename);
    const processClient = await getProcessClient_1.default();
    const api = new WatchFileApi_1.default(processClient);
    let watch = await api.findFileWatch(filename);
    if (!watch) {
        watch = await api.createFileWatch(filename);
    }
    api.listenToFile(watch, (evt) => {
        console.log('listenToFile saw: ' + evt.stringify());
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