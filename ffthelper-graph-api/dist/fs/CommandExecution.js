"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationReceiver_1 = require("./RelationReceiver");
const RelationReceiver_2 = require("./RelationReceiver");
class CommandExecution {
    constructor(graph, command) {
        this.graph = graph;
        this.command = command;
        this.commandName = command.commandName;
        this.flags = command.flags;
        this.pattern = command.toPattern();
    }
    toRelationSearch() {
        if (!this.output)
            throw new Error('missing this.output');
        const output = this.output;
        return {
            pattern: this.pattern,
            subSearchDepth: 0,
            isDone() { return output.isDone(); },
            start() { output.start(); },
            relation(r) { output.relation(r); },
            finish() { output.finish(); },
        };
    }
    outputTo(receiver) {
        if (this.output)
            throw new Error('already have this.output');
        this.output = receiver;
    }
    outputToStringRespond(respond) {
        if (this.output)
            throw new Error('already have this.output');
        this.output = RelationReceiver_2.receiveToStringRespond(this.graph, this.command, respond);
    }
    outputToRelationList(onDone) {
        if (this.output)
            throw new Error("already have a configured output");
        this.output = RelationReceiver_1.receiveToRelationList(onDone);
    }
}
exports.default = CommandExecution;
