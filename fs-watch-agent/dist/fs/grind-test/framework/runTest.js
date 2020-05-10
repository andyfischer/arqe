"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../../Graph"));
const runCommand_1 = __importDefault(require("./runCommand"));
function test(name, callback) {
    const graph = new Graph_1.default();
    function run(command, opts) {
        return runCommand_1.default(command, { graph, ...opts });
    }
    it(name, () => callback({ run, graph }));
}
exports.default = test;
//# sourceMappingURL=runTest.js.map