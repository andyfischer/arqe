"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openWebSocketClient_1 = __importDefault(require("./fs/socket/openWebSocketClient"));
const chokidar_1 = __importDefault(require("chokidar"));
const watchesByFilename = {};
async function main() {
    const conn = await openWebSocketClient_1.default();
    const watcher = chokidar_1.default.watch('', {
        persistent: true
    });
    watcher.on('change', path => {
        console.log('path has changed: ' + path);
        conn.run(`set file-watch/* filename(${path}) version((increment))`);
    });
    conn.run('listen -get file-watch/* filename/*', {
        relation(rel) {
            console.log('saw: ' + rel.stringify());
            const filename = rel.getTagValue('filename');
            if (!watchesByFilename[filename]) {
                console.log('creating watch for file: ' + filename);
                watchesByFilename[filename] = {};
                watcher.add(filename);
            }
        },
        finish() { }
    });
    console.log('Connected to server');
}
main()
    .catch(console.error);
//# sourceMappingURL=index.js.map