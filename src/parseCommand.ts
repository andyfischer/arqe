
import { parseAsOneSimple } from './parse-query/parseQueryV3'
import Command, { newCommand, CommandTag } from './Command'
import { lexStringToIterator, TokenIterator, Token, t_ident, t_quoted_string, t_star,
    t_equals, t_exclamation, t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
    t_double_equals, t_dot, t_question, t_integer } from './lexer'

interface Clause {
    str?: string
    payload?: string
}

function acceptableTagValue(token: Token) {
    return token.match !== t_space && token.match !== t_newline;
}

function nextIsPayloadStart(it: TokenIterator) {
    return it.nextIs(t_double_equals);
}

function parseOneTag(it: TokenIterator): CommandTag {
    if (it.tryConsume(t_star)) {
        return {
            star: true
        };
    }

    let negate = false;

    if (it.nextIs(t_exclamation)) {
        negate = true;
        it.consume();
    }

    if (it.tryConsume(t_dot)) {
        const optionValue = it.consumeTextWhile(acceptableTagValue);
        return {
            tagType: 'option',
            tagValue: optionValue,
            negate
        }
    }

    const tagType = it.consumeNextUnquotedText();

    let tagValue = null;
    let starValue = false;
    let questionValue = false;

    if (it.tryConsume(t_slash)) {
        if (it.tryConsume(t_star)) {
            starValue = true;
        } else if (it.tryConsume(t_question)) {
            questionValue = true;
        } else {
            tagValue = it.consumeTextWhile(acceptableTagValue);
        }
    }

    return {
        tagType,
        tagValue,
        negate,
        starValue,
        questionValue
    }
}

function parseCommandTags(it: TokenIterator, command: Command) {
    while (true) {
        it.skipSpaces();

        if (it.finished() || it.nextIs(t_newline) || nextIsPayloadStart(it))
            return;

        const tag = parseOneTag(it);

        command.tags.push(tag);
    }
}

function parsePayload(it: TokenIterator, command: Command) {
    if (!nextIsPayloadStart(it))
        return;

    it.consume(t_double_equals);
    it.skipSpaces();

    let str = "";

    while (!it.nextIs(t_newline) && !it.finished())
        str += it.consumeNextText();

    command.payloadStr = str;
}

function parseCommandFromLexed(it: TokenIterator): Command {
    const command = newCommand();

    // Parse directive
    it.skipSpaces();
    if (!it.nextIs(t_ident) && !it.nextIs(t_quoted_string))
        throw new Error("expected identifier, saw: " + it.nextText());

    command.command = it.consumeNextUnquotedText();

    // Parse tag args
    parseCommandTags(it, command);

    // Parse payload
    parsePayload(it, command);

    return command;
}

export default function parseCommand(str: string) {
    const it = lexStringToIterator(str);
    const command = parseCommandFromLexed(it);
    return command;
}

export function commandTagToString(tag: CommandTag) {
    if (tag.star)
        return '*';

    let s = tag.tagType;

    if (tag.tagValue) {
        s += '/' + tag.tagValue;
    } else if (tag.starValue) {
        s += '*';
    } else if (tag.questionValue) {
        s += '?';
    }

    return s;
}

export function commandArgsToString(tags: CommandTag[]) {
    return tags.map(commandTagToString).join(' ');
}

export function parsedCommandToString(command: Command) {
    return command.command + ' ' + commandArgsToString(command.tags)
}

export function parseAsSave(str: string) {
    const command = parseCommand(str);

    if (command.command !== 'save')
        throw new Error("Expected 'save' command: " + str);

    return command.tags;
}

export function normalizeExactTag(tags: CommandTag[]) {
    const argStrs = tags.map(arg => arg.tagType + '/' + arg.tagValue)
    argStrs.sort();
    return argStrs.join(' ');
}

