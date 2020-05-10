"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandChain {
    constructor() {
        this.commands = [];
    }
    str() {
        return this.commands.map(c => c.stringify()).join(' | ');
    }
}
exports.default = CommandChain;
//# sourceMappingURL=CommandChain.js.map