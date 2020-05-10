"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const utils_1 = require("../utils");
function spawn(cmd) {
    const args = cmd.split(' ');
    utils_1.print('spawning process: ' + cmd);
    const proc = child_process_1.default.spawn(args[0], args.slice(1));
}
exports.spawn = spawn;
function zeroPad(num, len) {
    num = num + '';
    while (num.length < len)
        num = '0' + num;
    return num;
}
exports.zeroPad = zeroPad;
//# sourceMappingURL=index.js.map