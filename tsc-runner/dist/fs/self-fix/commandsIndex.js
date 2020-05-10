"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const ts_1 = require("../codewriter/ts");
const utils_1 = require("./utils");
const shared_1 = require("../codewriter/shared");
async function generateCommandImports() {
    const dir = path_1.default.join(__dirname, '../../src/commands');
    const modules = await utils_1.listModulesInsideFolder(dir);
    const out = new ts_1.TypescriptWriter();
    out.import_('{ Snapshot }', '../framework');
    for (const moduleName of modules)
        out.import_(moduleName, `./${moduleName}`);
    out.blankLine();
    out.openBlock("export function implementEveryCommand(snapshot: Snapshot) {");
    for (const moduleName of modules)
        out.line(`${shared_1.toIdentifier(moduleName)}(snapshot);`);
    out.closeBlock();
    await out.writeToFile(path_1.default.join(dir, 'index.ts'));
}
exports.default = generateCommandImports;
//# sourceMappingURL=commandsIndex.js.map