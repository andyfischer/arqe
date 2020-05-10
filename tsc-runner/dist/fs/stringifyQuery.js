"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
function commandTagToString(tag) {
    if (tag.unboundType)
        return '$' + tag.unboundType;
    if (tag.star)
        return '*';
    let s = tag.tagType;
    if (tag.tagValue) {
        if (tag.tagType === 'option')
            return '.' + tag.tagValue;
        s += '/' + tag.tagValue;
    }
    else if (tag.unboundValue) {
        s += '/$' + tag.unboundValue;
    }
    else if (tag.starValue) {
        s += '/*';
    }
    else if (tag.questionValue) {
        s += '?';
    }
    else if (tag.doubleStar) {
        s = '**';
    }
    return s;
}
exports.commandTagToString = commandTagToString;
function commandTagsToString(tags) {
    return tags.map(commandTagToString).join(' ');
}
exports.commandTagsToString = commandTagsToString;
function parsedCommandToString(command) {
    let str = command.commandName;
    for (const flag in command.flags) {
        str += ' -' + flag;
    }
    str += ' ' + commandTagsToString(command.tags);
    if (command.payloadStr != null) {
        str += ' == ' + command.payloadStr;
    }
    return str;
}
exports.parsedCommandToString = parsedCommandToString;
function stringifyCommandChain(chain) {
    return chain.commands.map(parsedCommandToString).join(' | ');
}
exports.stringifyCommandChain = stringifyCommandChain;
function appendTagInCommand(str, tag) {
    const parsed = parseCommand_1.default(str);
    parsed.tags.push({ tagType: tag });
    return parsedCommandToString(parsed);
}
exports.appendTagInCommand = appendTagInCommand;
function parseAsSet(str) {
    const command = parseCommand_1.default(str);
    if (command.commandName !== 'set')
        throw new Error("Expected 'set' command: " + str);
    return command.tags;
}
exports.parseAsSet = parseAsSet;
function normalizeExactTag(tags) {
    const argStrs = tags.map(arg => arg.tagType + '/' + arg.tagValue);
    argStrs.sort();
    return argStrs.join(' ');
}
exports.normalizeExactTag = normalizeExactTag;
//# sourceMappingURL=stringifyQuery.js.map