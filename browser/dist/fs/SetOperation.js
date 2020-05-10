"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SetOperation {
    constructor(graph, command, respond) {
        this.replyWithEcho = false;
        this.graph = graph;
        this.command = command;
        this.respond = respond;
    }
    run() {
        const { command, respond } = this;
        // Validate
        for (const tag of command.tags) {
            if (tag.starValue) {
                respond("#error can't use star pattern in 'set'");
                return;
            }
            if (tag.star) {
                respond("#error can't use star pattern in 'set'");
                return;
            }
            if (tag.doubleStar) {
                respond("#error can't use star pattern in 'set'");
                return;
            }
        }
        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.graph.getTypeInfo(arg.tagType).getUniqueId();
                this.replyWithEcho = true;
            }
        }
        this.graph.inMemory.runSave(this);
    }
    saveFinished(relation) {
        const { command, respond } = this;
        if (!relation)
            respond("#error couldn't save");
        this.graph.onRelationUpdated(command, relation);
        if (this.replyWithEcho) {
            respond(this.graph.schema.stringifyRelation(relation));
        }
        else {
            respond("#done");
        }
    }
}
exports.default = SetOperation;
