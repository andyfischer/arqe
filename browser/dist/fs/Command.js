"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RelationPattern_1 = __importDefault(require("./RelationPattern"));
class Command {
    constructor(command, tags, payload, flags) {
        this.command = command;
        this.tags = tags;
        this.payloadStr = payload;
        this.flags = flags;
    }
    toPattern() {
        return new RelationPattern_1.default(this.tags);
    }
}
exports.default = Command;
