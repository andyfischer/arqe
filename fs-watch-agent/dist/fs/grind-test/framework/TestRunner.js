"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../../Graph"));
const CommandConnection_1 = require("../../socket/CommandConnection");
const runCommand_1 = __importDefault(require("./runCommand"));
class TestRunner {
    constructor(suite, chaosMode) {
        this.run = (command, opts) => {
            return runCommand_1.default(command, {
                graph: this.graph,
                chaosMode: this.chaosMode,
                ...opts
            });
        };
        this.suite = suite;
        this.chaosMode = chaosMode;
        this.setup();
    }
    setup() {
        if (process.env.REMOTE_HOST) {
            const connection = CommandConnection_1.connectToServer(process.env.REMOTE_HOST);
            this.graph = connection;
            return;
        }
        const graph = new Graph_1.default();
        if (this.chaosMode && this.chaosMode.setupNewGraph) {
            this.chaosMode.setupNewGraph(graph);
        }
        this.graph = graph;
    }
}
exports.default = TestRunner;
//# sourceMappingURL=TestRunner.js.map