"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("./CommandMeta");
class SetOperation {
    constructor(graph, commandExec) {
        this.graph = graph;
        this.commandExec = commandExec;
        this.command = commandExec.command;
    }
    run() {
        const { command } = this;
        // Validate
        for (const tag of command.tags) {
            if (tag.starValue) {
                CommandMeta_1.emitCommandError(this.commandExec.output, "can't use star pattern in 'set'");
                return;
            }
            if (tag.star) {
                CommandMeta_1.emitCommandError(this.commandExec.output, "can't use star pattern in 'set'");
                return;
            }
            if (tag.doubleStar) {
                CommandMeta_1.emitCommandError(this.commandExec.output, "can't use star pattern in 'set'");
                return;
            }
        }
        this.graph.inMemory.runSave(this);
    }
    saveFinished(relation) {
        const { command } = this;
        if (!relation) {
            CommandMeta_1.emitCommandError(this.commandExec.output, "couldn't save");
            return;
        }
        this.graph.onRelationUpdated(command, relation);
        this.commandExec.output.start();
        this.commandExec.output.relation(relation);
        this.commandExec.output.finish();
    }
}
exports.default = SetOperation;
