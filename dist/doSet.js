"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("./CommandMeta");
function runSetStep(graph, commandExec) {
    const command = commandExec.command;
    const output = commandExec.output;
    if (!command)
        throw new Error('missing commandExec.command');
    for (const tag of command.tags) {
        if (tag.starValue || tag.star || tag.doubleStar) {
            CommandMeta_1.emitCommandError(output, "can't use star pattern in 'set'");
            commandExec.output.finish();
            return;
        }
    }
    graph.inMemory.runSave(command.toRelation(), {
        relation: (rel) => {
            graph.onRelationUpdated(command, rel);
            output.relation(rel);
        },
        finish: () => {
            output.finish();
        },
        isDone: () => false
    });
}
exports.runSetStep = runSetStep;
//# sourceMappingURL=doSet.js.map