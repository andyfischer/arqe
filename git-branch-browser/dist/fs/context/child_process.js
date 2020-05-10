"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runningInBrowser_1 = __importDefault(require("./runningInBrowser"));
let _exec;
if (runningInBrowser_1.default()) {
    _exec = () => { throw new Error("can't exec"); };
}
else {
    const ChildProcess = require('child_process');
    const Util = require('util');
    _exec = Util.promisify(ChildProcess.exec);
}
exports.exec = _exec;
//# sourceMappingURL=child_process.js.map