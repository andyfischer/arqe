"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pattern_1 = require("./Pattern");
const stringifyQuery_1 = require("./stringifyQuery");
class Command {
    constructor(commandName, tags, payload, flags) {
        this.commandName = commandName;
        this.tags = tags;
        this.payloadStr = payload;
        this.flags = flags;
    }
    toPattern() {
        return new Pattern_1.PatternValue(this.tags);
    }
    toRelation() {
        const rel = new Pattern_1.PatternValue(this.tags);
        rel.setPayload(this.payloadStr);
        return rel;
    }
    stringify() {
        return stringifyQuery_1.parsedCommandToString(this);
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map