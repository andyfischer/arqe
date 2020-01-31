
import Command, { CommandTag } from './Command'
import { lexStringToIterator, TokenIterator, Token, t_ident, t_quoted_string, t_star,
    t_equals, t_exclamation, t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
    t_double_equals, t_dot, t_question, t_integer, t_dash } from './lexer'

function acceptableTagValue(token: Token) {
    return token.match !== t_space && token.match !== t_newline;
}

function nextIsPayloadStart(it: TokenIterator) {
    return it.nextIs(t_double_equals);
}

interface InProgressQuery {
    tags: CommandTag[]
    flags: { [flag: string]: any }
}

function parseOneTag(it: TokenIterator): CommandTag {
    if (it.tryConsume(t_star)) {
        if (it.tryConsume(t_star)) {
            return {
                doubleStar: true
            };
        }

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

function parseFlag(it: TokenIterator, query: InProgressQuery) {
    it.consume(t_dash);

    if (!(it.nextIs(t_ident) || it.nextIs(t_integer))) {
        throw new Error('expected letter or number after -, found: ' + it.nextText());
    }

    const str = it.consumeNextText();
    query.flags[str] = true;
    if (!it.finished() && !it.nextIs(t_space))
        throw new Error(`Expected space after -${str}`);
}

function parseArgs(it: TokenIterator, query: InProgressQuery) {
    while (true) {
        it.skipSpaces();

        if (it.finished() || it.nextIs(t_newline) || nextIsPayloadStart(it))
            return;

        if (it.nextIs(t_dash)) {
            parseFlag(it, query);
            continue;
        }

        const tag = parseOneTag(it);

        query.tags.push(tag);
    }
}

function parsePayload(it: TokenIterator): string | null {
    if (!nextIsPayloadStart(it)) {
        return null;
    }

    it.consume(t_double_equals);
    it.skipSpaces();

    let str = "";

    while (!it.nextIs(t_newline) && !it.finished())
        str += it.consumeNextText();

    return str;
}

function parseQueryFromLexed(it: TokenIterator): Command {

    // Parse main command
    it.skipSpaces();
    if (!it.nextIs(t_ident) && !it.nextIs(t_quoted_string))
        throw new Error("expected identifier, saw: " + it.nextText());

    const command = it.consumeNextUnquotedText();

    const query: InProgressQuery = {
        tags: [],
        flags: {}
    }

    // Parse tag args
    parseArgs(it, query);

    // Parse payload
    const payload = parsePayload(it);

    return new Command(command, query.tags, payload, query.flags);
}

export default function parseCommand(str: string): Command {
    if (typeof str !== 'string')
        throw new Error('expected string');

    const it = lexStringToIterator(str);
    const command = parseQueryFromLexed(it);

    // Validate
    for (const tag of command.tags) {
        if (tag.tagType === '/') {
            throw new Error("internal error, parsed a tagType of '/' from: " + str);
        }
    }

    return command;
}

