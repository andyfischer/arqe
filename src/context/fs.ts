
import runningInBrowser from './runningInBrowser'

let _readFile;
let _readDir;
let _writeFile;

if (runningInBrowser()) {
    _readFile = () => { throw new Error("can't readFile") }
    _readDir = () => { throw new Error("can't readDir") }
    _writeFile = () => { throw new Error("can't writeFile") }
} else {
    const Fs = require('fs')
    const Util = require('util')
    _readFile = Util.promisify(Fs.readFile);
    _readDir = Util.promisify(Fs.readdir);
    _writeFile = Util.promisify(Fs.writeFile);
}

export const readFile = _readFile;
export const readDir = _readDir;
export const writeFile = _writeFile;
