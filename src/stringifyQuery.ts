
import Command from './Command'
import CommandChain from './CommandChain'
import parseCommand from './parseCommand'
import { PatternTag } from './Pattern'

export function commandTagToString(tag: PatternTag) {
    if (tag.unboundType)
        return '$' + tag.unboundType;

    if (tag.star)
        return '*';

    let s = tag.tagType;

    if (tag.tagValue) {
        if (tag.tagType === 'option')
            return '.' + tag.tagValue;

        s += '/' + tag.tagValue;
    } else if (tag.unboundValue) {
        s += '/$' + tag.unboundValue;
    } else if (tag.starValue) {
        s += '/*';
    } else if (tag.questionValue) {
        s += '?';
    } else if (tag.doubleStar) {
        s = '**';
    }

    return s;
}

export function commandTagsToString(tags: PatternTag[]) {
    return tags.map(commandTagToString).join(' ');
}

export function parsedCommandToString(command: Command) {
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

export function stringifyCommandChain(chain: CommandChain) {
    return chain.commands.map(parsedCommandToString).join(' | ');
}

export function appendTagInCommand(str: string, tag: string) {
    const parsed = parseCommand(str);
    parsed.tags.push({tagType: tag});
    return parsedCommandToString(parsed);
}

export function parseAsSet(str: string) {
    const command = parseCommand(str);

    if (command.commandName !== 'set')
        throw new Error("Expected 'set' command: " + str);

    return command.tags;
}

export function normalizeExactTag(tags: PatternTag[]) {
    const argStrs = tags.map(arg => arg.tagType + '/' + arg.tagValue)
    argStrs.sort();
    return argStrs.join(' ');
}

