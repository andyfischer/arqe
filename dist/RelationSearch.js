"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function newRelationSearch(pattern, output) {
    return {
        pattern,
        subSearchDepth: 0,
        relation(rel) { output.relation(rel); },
        finish() { output.finish(); }
    };
}
exports.newRelationSearch = newRelationSearch;
//# sourceMappingURL=RelationSearch.js.map