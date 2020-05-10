"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const verifyRespondProtocol_1 = __importDefault(require("../verifyRespondProtocol"));
const collectRespond_1 = __importDefault(require("../collectRespond"));
let _graph;
function initializeGraph() {
    const graph = new Graph_1.default();
    _graph = graph;
    return graph;
}
function run(command) {
    if (!_graph)
        _graph = initializeGraph();
    const graph = _graph;
    const verifier = verifyRespondProtocol_1.default(command, (err) => {
        fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
    });
    let response;
    let responseFinished = false;
    let resolveResponse;
    const collector = collectRespond_1.default(finishedValue => {
        responseFinished = true;
        if (resolveResponse) {
            resolveResponse(finishedValue);
        }
        else {
            response = finishedValue;
        }
    });
    graph.run(command, msg => {
        verifier(msg);
        collector(msg);
    });
    if (responseFinished)
        return response;
    return new Promise(r => { resolveResponse = r; });
}
exports.run = run;
function setup() {
    return {
        run
    };
}
exports.default = setup;
//# sourceMappingURL=TestSetup.js.map