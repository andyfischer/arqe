
import runningInBrowser from './runningInBrowser'
import { notifyFileChanged } from '../file-watch/notifyFileChanged'
import getProcessClient from '../toollib/getProcessClient'

let _readFile;
let _readFileSync;
let _readDir;
let _writeFile;

if (runningInBrowser()) {
    _readFile = () => { throw new Error("can't readFile") }
    _readFileSync = () => { throw new Error("can't readFileSync") }
    _readDir = () => { throw new Error("can't readDir") }
    _writeFile = () => { throw new Error("can't writeFile") }
} else {
    const Fs = require('fs')
    const Util = require('util')
    _readFile = Util.promisify(Fs.readFile);
    _readFileSync = Fs.readFileSync;
    _readDir = Util.promisify(Fs.readdir);
    _writeFile = Util.promisify(Fs.writeFile);
}

export const readFile = _readFile;
export const readFileSync = _readFileSync;
export const readDir = _readDir;
export const writeFile = _writeFile;

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
    .then(graph => notifyFileChanged(graph, filename))
    .catch(console.error)

    return true;
}
