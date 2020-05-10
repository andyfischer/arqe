"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const timedate_1 = require("../timedate");
function userDir() {
    return path_1.default.join(os_1.default.homedir(), '.futureshell');
}
exports.userDir = userDir;
async function setupUserDir() {
    const dir = userDir();
    if (!await fs_extra_1.default.exists(dir))
        await fs_extra_1.default.mkdir(dir);
    const env = path_1.default.join(dir, 'env.p');
    if (!await fs_extra_1.default.exists(env))
        await fs_extra_1.default.writeFile(env, '');
}
exports.setupUserDir = setupUserDir;
async function appendToLog(logName, str) {
    const file = path_1.default.join(userDir(), 'logs', logName, timedate_1.getDateStamp());
    fs_extra_1.default.outputFile(file, str + "\n", { flag: 'a' });
}
exports.appendToLog = appendToLog;
//# sourceMappingURL=index.js.map