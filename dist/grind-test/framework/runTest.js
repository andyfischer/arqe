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
    function set(command) {
        if (!command.startsWith('set '))
            command = 'set ' + command;
        return run(command);
    }
    function listen(command) {
        if (!command.startsWith('listen '))
            command = 'listen ' + command;
        let log = [];
        graph.run(command, {
            relation(rel) {
                if (rel.hasType('command-meta'))
                    return;
                log.push(rel.stringify());
            },
            finish() { }
        });
        return function getLog() {
            const out = log;
            log = [];
            return out;
        };
    }
    it(name, () => callback({ run, set, listen, graph }));
}
exports.default = test;
//# sourceMappingURL=runTest.js.map