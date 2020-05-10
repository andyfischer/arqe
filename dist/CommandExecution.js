"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            relation(r) { output.relation(r); },
            finish() { output.finish(); },
        };
    }
}
exports.default = CommandExecution;
//# sourceMappingURL=CommandExecution.js.map