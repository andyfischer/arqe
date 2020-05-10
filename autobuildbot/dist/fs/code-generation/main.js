"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const CodeGenerationApi_1 = __importDefault(require("./CodeGenerationApi"));
const DAOGenerator2_1 = require("./DAOGenerator2");
const TextAsCode_1 = require("./TextAsCode");
const watchFile_1 = __importDefault(require("../file-watch/watchFile"));
const minimist_1 = __importDefault(require("minimist"));
const runStandardProcess_1 = __importDefault(require("../toollib/runStandardProcess"));
async function runGeneration(graph) {
    const cliArgs = minimist_1.default(process.argv.slice(2));
    const filename = cliArgs['file'];
    watchFile_1.default(filename, () => {
        console.log(`running code generation (using ${filename})`);
        const dataSource = Graph_1.default.loadFromDumpFile(filename);
        const api = new CodeGenerationApi_1.default(dataSource);
        for (const target of api.listCodeGenerationTargets()) {
            const strategy = api.codeGenerationTargetStrategy(target);
            if (strategy === 'dao-api') {
                DAOGenerator2_1.runDAOGenerator2(dataSource, target);
            }
            else if (strategy === 'dao-api2') {
                DAOGenerator2_1.runDAOGenerator2(dataSource, target);
            }
            else if (strategy == 'text-as-code') {
                TextAsCode_1.generateTextAsCode(dataSource, target);
            }
            else {
                throw new Error("didn't understand code generation strategy: " + strategy);
            }
        }
    });
    await new Promise(resolve => { });
}
function main() {
    runStandardProcess_1.default(async (graph) => runGeneration(graph));
}
exports.main = main;
//# sourceMappingURL=main.js.map