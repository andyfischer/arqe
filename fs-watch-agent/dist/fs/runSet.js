"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookObjectSpace_1 = require("./hookObjectSpace");
function runSet(graph, relation, output) {
    if (hookObjectSpace_1.hookObjectSpaceSave(graph, relation, output))
        return;
    graph.inMemory.runSave(relation, {
        relation: (rel) => {
            graph.onRelationUpdated(relation);
            output.relation(rel);
        },
        finish: () => {
            output.finish();
        },
    });
}
exports.default = runSet;
//# sourceMappingURL=runSet.js.map