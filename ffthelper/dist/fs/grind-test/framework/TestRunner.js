"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const collectRespond_1 = __importDefault(require("../../collectRespond"));
const verifyRespondProtocol_1 = __importDefault(require("../../verifyRespondProtocol"));
const Graph_1 = __importDefault(require("../../Graph"));
const CommandConnection_1 = require("../../socket/CommandConnection");
class TestRunner {
    constructor(suite, chaosMode) {
        this.run = (command, opts) => {
            const runFunc = this.runFunc;
            const allowError = opts && opts.allowError;
            if (this.chaosMode && this.chaosMode.modifyRunCommand)
                command = this.chaosMode.modifyRunCommand(command);
            const verifier = verifyRespondProtocol_1.default(command, (err) => {
                fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
            });
            return new Promise((resolve, reject) => {
                const collector = collectRespond_1.default(resolve);
                runFunc(command, msg => {
                    if (msg && msg.startsWith('#error') && !allowError) {
                        fail(`Graph error: ${msg}`);
                        reject(msg);
                        return;
                    }
                    verifier(msg);
                    collector(msg);
                });
            });
        };
        this.suite = suite;
        this.chaosMode = chaosMode;
        this.setup();
    }
    setup() {
        if (process.env.REMOTE_HOST) {
            const connection = CommandConnection_1.connectToServer(process.env.REMOTE_HOST);
            this.runFunc = (m, r) => connection.run(m, r);
            return;
        }
        const graph = new Graph_1.default();
        if (this.chaosMode && this.chaosMode.setupNewGraph) {
            this.chaosMode.setupNewGraph(graph);
        }
        this.runFunc = (m, r) => graph.run(m, r);
    }
}
exports.default = TestRunner;
