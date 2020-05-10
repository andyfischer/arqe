"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bootstrapGraph(graph) {
    graph.runSilent('set typeinfo/branch .inherits');
    graph.runSilent('set typeinfo/testcase .inherits');
    graph.runSilent('set typeinfo/testcase .order == before');
    graph.runSilent('set typeinfo/typeinfo .order == before');
    graph.runSilent('set typeinfo/branch .order == after');
}
exports.default = bootstrapGraph;
//# sourceMappingURL=bootstrapGraph.js.map