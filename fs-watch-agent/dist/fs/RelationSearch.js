"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function relationSearchFromPattern(pattern, output) {
    return {
        pattern,
        subSearchDepth: 0,
        relation(rel) { output.relation(rel); },
        finish() { output.finish(); }
    };
}
exports.relationSearchFromPattern = relationSearchFromPattern;
//# sourceMappingURL=RelationSearch.js.map