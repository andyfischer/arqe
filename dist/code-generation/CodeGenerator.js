"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const CodeGenerationApi_1 = __importDefault(require("./CodeGenerationApi"));
const DAOGenerator_1 = require("./DAOGenerator");
const TextAsCode_1 = require("./TextAsCode");
const watchFile_1 = __importDefault(require("../file-watch/watchFile"));
function runCodeGenerator(filename) {
    watchFile_1.default(filename, () => {
        const graph = Graph_1.default.loadFromDumpFile(filename);
        const api = new CodeGenerationApi_1.default(graph);
        for (const target of api.listCodeGenerationTargets()) {
            const strategy = api.codeGenerationTargetStrategy(target);
            if (strategy === 'dao-api') {
                DAOGenerator_1.generateAPI(graph, target);
            }
            else if (strategy == 'text-as-code') {
                TextAsCode_1.generateTextAsCode(graph, target);
            }
            else {
                throw new Error("didn't understand code generation strategy: " + strategy);
            }
        }
    });
}
exports.runCodeGenerator = runCodeGenerator;
//# sourceMappingURL=CodeGenerator.js.map