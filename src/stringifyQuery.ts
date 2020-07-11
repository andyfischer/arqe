
import Command from './Command'
import CommandChain from './CommandChain'
import parseCommand from './parseCommand'
import PatternTag, { newTag } from './TupleTag'
import { stringifyExpr } from './parseExpr'

function tagValueNeedsParens(s: string) {
    for (let i = 0; i < s.length; i++)
        if (s.charAt(i) === ' ' || s.charAt(i) === '*' || s.charAt(i) === '/')
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
        return tag.attr + '/$' + tag.identifier;
    }

    if (tag.tagValue) {

        if (typeof tag.tagValue !== 'string')
            throw new Error(`internal error: tagValue isn't a string: ` + JSON.stringify(tag.tagValue));

        let s = '';

        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `;
        }

        const needsParens = tagValueNeedsParens(tag.tagValue);

        if (needsParens) {
            s += tag.attr + '(';
        } else {
            s += tag.attr + '/';
        }

        s += tag.tagValue;

        if (needsParens)
            s += ')';

        return s;
    }

    if (tag.valueExpr) {
        return tag.attr + '/' + stringifyExpr(tag.valueExpr)

    } else if (tag.starValue) {
        return tag.attr + '/*';
    }

    if (tag.attr) {
        let s = '';
        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `
        }
        s += tag.attr;

        if (tag.optional)
            s += '?';

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
    
    str += ' ' + commandTagsToString(command.pattern.tags);

    return str;
}

export function stringifyCommandChain(chain: CommandChain) {
    return chain.commands.map(parsedCommandToString).join(' | ');
}

export function appendTagInCommand(str: string, tag: string) {
    const parsed = parseCommand(str);
    parsed.pattern = parsed.pattern.addTagObj(newTag(tag));
    return parsedCommandToString(parsed);
}

export function parseAsSet(str: string) {
    const command = parseCommand(str);

    if (command.commandName !== 'set')
        throw new Error("Expected 'set' command: " + str);

    return command.pattern.tags;
}

export function normalizeExactTag(tags: PatternTag[]) {
    const argStrs = tags.map(arg => arg.attr + '/' + arg.tagValue)
    argStrs.sort();
    return argStrs.join(' ');
}

