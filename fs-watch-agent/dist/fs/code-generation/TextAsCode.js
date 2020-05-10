"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TextAsCodeApi_1 = __importDefault(require("./TextAsCodeApi"));
const fs_1 = require("../context/fs");
function javascriptTemplate(vars) {
    const text = vars.text
        .replace(/\$/g, "\\$");
    return (`export default \`${text}\``);
}
function generateTextAsCode(graph, target) {
    const api = new TextAsCodeApi_1.default(graph);
    const fromFile = api.fromFile(target);
    const destinationFilename = api.destinationFilename(target);
    const text = fs_1.readFileSync(fromFile, 'utf8');
    const jsContents = javascriptTemplate({ text });
    fs_1.writeFileSyncIfUnchanged(destinationFilename, jsContents);
    console.log('generated file is up-to-date: ' + destinationFilename);
}
exports.generateTextAsCode = generateTextAsCode;
//# sourceMappingURL=TextAsCode.js.map