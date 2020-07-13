
import Command from './Command'
import CommandChain from './CommandChain'
import parseCommand from './parseCommand'
import TupleTag, { newTag } from './TupleTag'
import { stringifyExpr } from './parseExpr'

function tagValueNeedsParens(s: string) {
    for (let i = 0; i < s.length; i++)
        if (s.charAt(i) === ' ' || s.charAt(i) === '*' || s.charAt(i) === '/')
            return true;

    return false;
}

export function patternTagToString(tag: TupleTag) {
    if (tag.star && tag.identifier)
        return '$' + tag.identifier;

    if (tag.star)
        return '*';

    if (tag.doubleStar)
        return '**'

    if (tag.starValue && tag.identifier) {
        return tag.attr + '/$' + tag.identifier;
    }

    if (tag.value) {

        if (typeof tag.value !== 'string' && typeof tag.value !== 'number')
            throw new Error(`internal error: tag value isn't a string or number: ` + JSON.stringify(tag.value));

        let s = '';

        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `;
        }

        const valStr = ''+tag.value;

        const needsParens = tagValueNeedsParens(valStr);

        if (needsParens) {
            s += tag.attr + '(';
        } else {
            s += tag.attr + '/';
        }

        s += valStr;

        if (needsParens)
            s += ')';

        return s;
    }

    if (tag.exprValue) {
        return tag.attr + '/' + stringifyExpr(tag.exprValue)

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

export function commandTagsToString(tags: TupleTag[]) {
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

export function normalizeExactTag(tags: TupleTag[]) {
    const argStrs = tags.map(arg => arg.attr + '/' + arg.value)
    argStrs.sort();
    return argStrs.join(' ');
}

