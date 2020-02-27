
import Command from './Command'
import CommandChain from './CommandChain'
import parseCommand from './parseCommand'
import PatternTag from './PatternTag'

export function commandTagToString(tag: PatternTag) {
    if (tag.star && tag.identifier)
        return '$' + tag.identifier;

    if (tag.star)
        return '*';

    if (tag.doubleStar)
        return '**'

    if (tag.starValue && tag.identifier) {
        return tag.tagType + '/$' + tag.identifier;
    }

    if (tag.tagValue) {

        let s = '';

        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `
        }

        if (tag.tagType === 'option')
            s += '.'
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
            s += `[from \$${tag.identifier}] `
        }
        s += tag.tagType;
        return s;
    }
    
    throw new Error('unhandled case in commandTagToString');

    return ''
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

