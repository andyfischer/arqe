"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runningInBrowser_1 = __importDefault(require("./runningInBrowser"));
const notifyFileChanged_1 = require("../file-watch/notifyFileChanged");
const getProcessClient_1 = __importDefault(require("../toollib/getProcessClient"));
let _readFile;
let _readFileSync;
let _readDir;
let _writeFile;
if (runningInBrowser_1.default()) {
    _readFile = () => { throw new Error("can't readFile"); };
    _readFileSync = () => { throw new Error("can't readFileSync"); };
    _readDir = () => { throw new Error("can't readDir"); };
    _writeFile = () => { throw new Error("can't writeFile"); };
}
else {
    const Fs = require('fs');
    const Util = require('util');
    _readFile = Util.promisify(Fs.readFile);
    _readFileSync = Fs.readFileSync;
    _readDir = Util.promisify(Fs.readdir);
    _writeFile = Util.promisify(Fs.writeFile);
}
exports.readFile = _readFile;
exports.readFileSync = _readFileSync;
exports.readDir = _readDir;
exports.writeFile = _writeFile;
function writeFileSyncIfUnchanged(filename, contents) {
    const Fs = require('fs');
    try {
        const existing = Fs.readFileSync(filename, 'utf8');
        if (contents === existing)
            return false;
    }
    catch (e) {
    }
    Fs.writeFileSync(filename, contents);
    getProcessClient_1.default()
        .then(graph => notifyFileChanged_1.notifyFileChanged(graph, filename))
        .catch(console.error);
    return true;
}
exports.writeFileSyncIfUnchanged = writeFileSyncIfUnchanged;
//# sourceMappingURL=fs.js.map