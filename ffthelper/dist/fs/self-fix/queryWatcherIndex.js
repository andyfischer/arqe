"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const ts_1 = require("../codewriter/ts");
const shared_1 = require("../codewriter/shared");
const utils_1 = require("./utils");
async function default_1() {
    const dir = path_1.default.join(__dirname, '../../src/query-watchers');
    const modules = await utils_1.listModulesInsideFolder(dir);
    const out = new ts_1.TypescriptWriter();
    out.import_('{ Snapshot }', '../framework');
    for (const moduleName of modules)
        out.import_(moduleName, `./${moduleName}`);
    out.blankLine();
    out.openBlock("export function mountEveryQueryWatcher(snapshot: Snapshot) {");
    for (const moduleName of modules)
        out.line(`snapshot.mountQueryWatcher('${moduleName}', ${shared_1.toIdentifier(moduleName)})`);
    out.closeBlock();
    await out.writeToFile(path_1.default.join(dir, 'index.ts'));
}
exports.default = default_1;
