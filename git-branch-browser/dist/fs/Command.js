"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyQuery_1 = require("./stringifyQuery");
class Command {
    constructor(commandName, pattern, flags) {
        this.commandName = commandName;
        this.pattern = pattern;
        this.flags = flags;
    }
    toPattern() {
        return this.pattern;
    }
    toRelation() {
        return this.pattern;
    }
    stringify() {
        return stringifyQuery_1.parsedCommandToString(this);
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map