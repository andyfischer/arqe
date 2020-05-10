"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
const PatternTag_1 = require("./PatternTag");
function commandTagToString(tag) {
    if (tag.star && tag.identifier)
        return '$' + tag.identifier;
    if (tag.star)
        return '*';
    if (tag.doubleStar)
        return '**';
    if (tag.starValue && tag.identifier) {
        return tag.tagType + '/$' + tag.identifier;
    }
    if (tag.tagValue) {
        let s = '';
        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `;
        }
        if (tag.tagType === 'option')
            s += '.';
        else
            s += tag.tagType + '/';
        s += tag.tagValue;
        return s;
    }
    if (tag.starValue) {
        return tag.tagType + '/*';
    }
    if (tag.tagType) {
        let s = '';
        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `;
        }
        s += tag.tagType;
        return s;
    }
    throw new Error('unhandled case in commandTagToString');
    return '';
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
    parsed.tags.push(PatternTag_1.newTag(tag));
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
