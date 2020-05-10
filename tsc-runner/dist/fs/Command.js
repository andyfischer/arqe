"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RelationPattern_1 = __importDefault(require("./RelationPattern"));
const stringifyQuery_1 = require("./stringifyQuery");
class Command {
    constructor(commandName, tags, payload, flags) {
        this.commandName = commandName;
        this.tags = tags;
        this.payloadStr = payload;
        this.flags = flags;
    }
    toPattern() {
        return new RelationPattern_1.default(this.tags);
    }
    stringify() {
        return stringifyQuery_1.parsedCommandToString(this);
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map