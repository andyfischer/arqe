"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bootstrapGraph(graph) {
    graph.run('set typeinfo/branch .inherits');
    graph.run('set typeinfo/testcase .inherits');
    graph.run('set typeinfo/testcase .order == before');
    graph.run('set typeinfo/typeinfo .order == before');
    graph.run('set typeinfo/branch .order == after');
}
exports.default = bootstrapGraph;
