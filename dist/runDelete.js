"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("./CommandMeta");
function runDelete(graph, pattern, output) {
    for (const slot of graph.inMemory.iterateSlots(pattern)) {
        slot.del();
        graph.onRelationDeleted(slot.relation);
    }
    CommandMeta_1.emitActionPerformed(output);
    output.finish();
}
exports.default = runDelete;
//# sourceMappingURL=runDelete.js.map