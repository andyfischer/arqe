"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
let _graph;
function initializeGraph() {
    const graph = new Graph_1.default();
    return graph;
}
function run(command) {
    if (!_graph)
        _graph = initializeGraph();
    const graph = _graph;
}
exports.run = run;
//# sourceMappingURL=Setup.js.map