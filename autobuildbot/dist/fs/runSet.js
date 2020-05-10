"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookObjectSpace_1 = require("./hookObjectSpace");
function runSet(graph, relation, output) {
    if (hookObjectSpace_1.hookObjectSpaceSave(graph, relation, output))
        return;
    graph.inMemory.runSave(relation, output);
}
exports.default = runSet;
//# sourceMappingURL=runSet.js.map