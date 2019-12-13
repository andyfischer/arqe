
import { parseAsOneSimple } from './parse-query/parseQueryV3'
import Command, { newCommand, CommandTag } from './Command'
import { lexStringToIterator, TokenIterator, Token, t_ident, t_quoted_string, t_star,
    t_equals, t_dash, t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
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

function parseOneTag(it: TokenIterator) {
    if (it.tryConsume(t_star)) {
        return {
            starType: true
        };
    }

    let subtract = false;

    if (it.nextIs(t_dash) && !it.nextIs(t_space, 1)) {
        subtract = true;
        it.consume();
    }

    if (it.tryConsume(t_dot)) {
        const optionValue = it.consumeTextWhile(acceptableTagValue);
        return {
            tagType: 'option',
            tagValue: optionValue,
            subtract
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
        subtract,
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

export function commandArgsToString(tags: CommandTag[]) {
    return tags.map(arg => {
        let s = arg.tagType;

        if (arg.tagValue) {
            s += '/' + arg.tagValue;
        } else if (arg.starValue) {
            s += '*';
        } else if (arg.questionValue) {
            s += '?';
        }

        return s;
    }).join(' ');
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
