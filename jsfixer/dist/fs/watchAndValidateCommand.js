"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = require("./parseCommand");
const internalError_1 = __importDefault(require("./internalError"));
class SetShouldEmitRelation {
    constructor(commandStr, pattern) {
        this.sawRelation = false;
        this.commandErrored = false;
        this.commandStr = commandStr;
        this.pattern = pattern;
    }
    static maybeCreate(commandStr, command) {
        if (command.commands.length > 1)
            return null;
        if (command.commands[0].commandName != 'set')
            return null;
        for (const tag of command.commands[0].toPattern().tags) {
            if (tag.valueExpr)
                return null;
        }
        return new SetShouldEmitRelation(commandStr, command.commands[0].toPattern());
    }
    relation(rel) {
        if (rel.hasType('command-meta')) {
            if (rel.hasType('error'))
                this.commandErrored = true;
        }
        this.sawRelation = true;
    }
    finish() {
        if (!this.sawRelation && !this.commandErrored) {
            internalError_1.default('SetShouldEmitRelation validation failed on: ' + this.commandStr);
        }
    }
}
const validationClasses = [
    SetShouldEmitRelation
];
function watchAndValidateCommand(commandStr, output) {
    const parsed = parseCommand_1.parseCommandChain(commandStr);
    const validations = [];
    for (const clss of validationClasses) {
        const validation = clss.maybeCreate(commandStr, parsed);
        if (validation)
            validations.push(validation);
    }
    let sentFinish = false;
    let finishStackTrace = null;
    return {
        relation(rel) {
            for (const v of validations)
                v.relation(rel);
            output.relation(rel);
        },
        finish() {
            if (sentFinish) {
                console.error('Validation failed, received two finish() calls: ' + commandStr);
                console.error('First finish() call: ' + finishStackTrace.stack);
                console.error('Second finish call: ' + (new Error()).stack);
                internalError_1.default('Validation failed, received two finish() calls: ' + commandStr);
                return;
            }
            for (const v of validations)
                v.finish();
            sentFinish = true;
            finishStackTrace = new Error();
            output.finish();
        }
    };
}
exports.default = watchAndValidateCommand;
//# sourceMappingURL=watchAndValidateCommand.js.map