"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function newRelationSearch(graph, pattern, output) {
    return {
        graph,
        pattern,
        subSearchDepth: 0,
        relation(rel) { output.relation(rel); },
        finish() { output.finish(); }
    };
}
exports.newRelationSearch = newRelationSearch;
//# sourceMappingURL=SearchOperation.js.map