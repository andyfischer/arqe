
import runningInBrowser from './runningInBrowser'
//import { notifyFileChanged } from '../old/file-watch/notifyFileChanged'
import getProcessClient from '../toollib/getProcessClient'

let _readFile;
let _readFileSync;
let _readDir;
let _writeFile;
let _writeFileSync;

if (runningInBrowser()) {
    _readFile = () => { throw new Error("can't readFile on this platform") }
    _readFileSync = () => { throw new Error("can't readFileSync on this platform") }
    _readDir = () => { throw new Error("can't readDir on this platform") }
    _writeFile = () => { throw new Error("can't writeFile on this platform") }
    _writeFileSync = () => { throw new Error("can't writeFileSync on this platform") }
} else {
    const Fs = require('fs')
    const Util = require('util')
    _readFile = Util.promisify(Fs.readFile);
    _readFileSync = Fs.readFileSync;
    _readDir = Util.promisify(Fs.readdir);
    _writeFile = Util.promisify(Fs.writeFile);
    _writeFileSync = Util.promisify(Fs.writeFileSync);
}

export const readFile = _readFile;
export const readFileSync = _readFileSync;
export const readDir = _readDir;
export const writeFile = _writeFile;
export const writeFileSync = _writeFileSync;

export function writeFileSyncIfUnchanged(filename: string, contents: string) {
    const Fs = require('fs');
    try {
        const existing = Fs.readFileSync(filename, 'utf8')

        if (contents === existing)
            return false;
    } catch (e) {
    }

    Fs.writeFileSync(filename, contents);

    getProcessClient()
    //.then(graph => notifyFileChanged(graph, filename))
    .catch(console.error)

    return true;
}
