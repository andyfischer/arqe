"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SetResponseFormatter {
    constructor(graph, command, respond) {
        this.replyWithEcho = false;
        this.graph = graph;
        this.respond = respond;
        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.graph.getTypeInfo(arg.tagType).getUniqueId();
                this.replyWithEcho = true;
            }
        }
    }
    start() {
    }
    relation(rel) {
        if (rel.hasType('command-meta') && rel.hasType('error')) {
            this.respond('#error ' + rel.getValue());
            return;
        }
        if (this.replyWithEcho) {
            this.respond(rel.stringifyToCommand());
        }
        else {
            this.respond("#done");
        }
    }
    deleteRelation() { }
    isDone() { return false; }
    finish() { }
}
exports.default = SetResponseFormatter;
