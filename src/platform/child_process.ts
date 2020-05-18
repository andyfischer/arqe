
import runningInBrowser from './runningInBrowser'

let _exec;

if (runningInBrowser()) {
    _exec = () => { throw new Error("can't exec") }
} else {
    const ChildProcess = require('child_process')
    const Util = require('util')
    _exec = Util.promisify(ChildProcess.exec);
}

export const exec = _exec;
