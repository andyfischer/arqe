"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const collectRespond_1 = __importDefault(require("../collectRespond"));
const verifyRespondProtocol_1 = __importDefault(require("../verifyRespondProtocol"));
const Graph_1 = __importDefault(require("../Graph"));
class TestRunner {
    constructor(suite, chaosMode) {
        this.run = (command, opts) => {
            const { graph } = this;
            const allowError = opts && opts.allowError;
            if (this.chaosMode && this.chaosMode.modifyRunCommand)
                command = this.chaosMode.modifyRunCommand(command);
            const verifier = verifyRespondProtocol_1.default(command, (err) => {
                fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
            });
            return new Promise((resolve, reject) => {
                const collector = collectRespond_1.default(resolve);
                graph.run(command, msg => {
                    if (msg && msg.startsWith('#error') && !allowError) {
                        reject(msg);
                    }
                    verifier(msg);
                    collector(msg);
                });
            });
        };
        this.suite = suite;
        this.graph = new Graph_1.default();
        this.chaosMode = chaosMode;
        if (this.chaosMode && this.chaosMode.setupNewGraph) {
            this.chaosMode.setupNewGraph(this.graph);
        }
    }
}
exports.default = TestRunner;
//# sourceMappingURL=TestRunner.js.map