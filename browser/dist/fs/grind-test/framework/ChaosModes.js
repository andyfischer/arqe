"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("../../parseCommand"));
const stringifyQuery_1 = require("../../stringifyQuery");
exports.ReparseCommand = {
    name: 'reparseCommand',
    shortDescription: 'reparse command',
    modifyRunCommand(command) {
        const parsed = parseCommand_1.default(command);
        command = stringifyQuery_1.parsedCommandToString(parsed);
        return command;
    }
};
exports.InsertExtraTag = {
    name: 'insertExtraTag',
    shortDescription: 'insert extra tag',
    modifyRunCommand(command) {
        const parsed = parseCommand_1.default(command);
        const pattern = parsed.toPattern();
        // Don't mess with certain relations.
        if (pattern.hasType('typeinfo') || pattern.hasType('filesystem-mount'))
            return command;
        return stringifyQuery_1.appendTagInCommand(command, 'extra');
    }
};
exports.GetInheritedBranch = {
    name: 'getInheritedBranch',
    shortDescription: 'get inherited branch',
    setupNewGraph(graph) {
        graph.run('set typeinfo/chaosbranch .inherits');
    },
    modifyRunCommand(command) {
        if (command.startsWith('get ')) {
            command = stringifyQuery_1.appendTagInCommand(command, 'chaosbranch/123');
        }
        return command;
    }
};
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
exports.ScrambleTagOrder = {
    name: 'scrambleTagOrder',
    shortDescription: 'scramble tag order',
    modifyRunCommand(command) {
        const parsed = parseCommand_1.default(command);
        parsed.tags = shuffle(parsed.tags);
        const modified = stringifyQuery_1.parsedCommandToString(parsed);
        // console.log(`scramble: ${command} -> ${modified}`)
        return modified;
    }
};
// Modes to add:
//  - Scramble tag order
//  - Enable specific optimizations
