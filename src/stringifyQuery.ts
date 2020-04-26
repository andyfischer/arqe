
import Command from './Command'
import CommandChain from './CommandChain'
import parseCommand from './parseCommand'
import PatternTag, { newTag } from './PatternTag'
import { stringifyExpr } from './parseExpr'

function tagValueNeedsParens(s: string) {
    for (let i = 0; i < s.length; i++)
        if (s.charAt(i) === ' ')
            return true;

    return false;
}

export function patternTagToString(tag: PatternTag) {
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
            s += `[from \$${tag.identifier}] `;
        }

        const needsParens = tagValueNeedsParens(tag.tagValue);

        if (needsParens) {
            s += tag.tagType + '(';
        } else if (tag.tagType === 'option') {
            s += '.'
        } else {
            s += tag.tagType + '/';
        }

        s += tag.tagValue;

        if (needsParens)
            s += ')';

        return s;
    }

    if (tag.valueExpr) {
        return tag.tagType + '/' + stringifyExpr(tag.valueExpr)

    } else if (tag.starValue) {
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
    
    throw new Error('unhandled case in patternTagToString');

    return ''
}

export function commandTagsToString(tags: PatternTag[]) {
    return tags.map(patternTagToString).join(' ');
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
    parsed.tags.push(newTag(tag));
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

