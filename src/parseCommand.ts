
import Command from './Command'
import CommandChain from './CommandChain'
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import { PatternTag, FixedTag } from './Pattern'
import { lexStringToIterator, TokenIterator, Token, t_ident, t_quoted_string, t_star,
    t_equals, t_exclamation, t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
    t_double_equals, t_dot, t_question, t_integer, t_dash, t_dollar, t_lbracket, t_rbracket } from './lexer'

function acceptableTagValue(token: Token) {
    return token.match !== t_space && token.match !== t_newline;
}

function nextIsPayloadStart(it: TokenIterator) {
    return it.nextIs(t_double_equals);
}

interface InProgressQuery {
    tags: PatternTag[]
    flags: { [flag: string]: any }
    payload: string | null
}

function parseOneTag(it: TokenIterator): PatternTag {

    let identifier;

    if (it.tryConsume(t_lbracket)) {
        if (!it.nextIs(t_ident) || it.nextText() !== 'from')
            throw new Error("expected 'from', found: " + it.nextText());

        it.consume();
        it.skipSpaces();
        if (!it.tryConsume(t_dollar))
            throw new Error("expected '$', found: " + it.nextText());

        identifier = it.consumeNextText();

        if (!it.tryConsume(t_rbracket))
            throw new Error("expected ']', found: " + it.nextText());

        it.skipSpaces();
    }

    if (it.tryConsume(t_star)) {
        if (it.tryConsume(t_star)) {
            return {
                doubleStar: true
            };
        }

        return {
            star: true,
            identifier
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
            identifier,
            negate
        }
    }
    
    if (it.tryConsume(t_dollar)) {
        const unboundVar = it.consumeNextUnquotedText();
        return {
            tagType: null,
            identifier: unboundVar,
            star: true
        }
    }

    const tagType = it.consumeNextUnquotedText();

    if (tagType === '/')
        throw new Error("syntax error, tagType was '/'");

    let tagValue = null;
    let starValue = false;
    let questionValue = false;

    if (it.tryConsume(t_slash)) {
        if (it.tryConsume(t_star)) {
            starValue = true;
        } else if (it.tryConsume(t_question)) {
            questionValue = true;
        } else if (it.tryConsume(t_dollar)) {
            identifier = it.consumeNextUnquotedText();
            starValue = true;
        } else {
            tagValue = it.consumeTextWhile(acceptableTagValue);
        }
    }

    return {
        tagType,
        tagValue,
        negate,
        starValue,
        questionValue,
        identifier
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

        if (it.finished() || it.nextIs(t_newline) || it.nextIs(t_bar) || nextIsPayloadStart(it))
            break;

        if (it.nextIs(t_dash)) {
            parseFlag(it, query);
            continue;
        }

        const tag = parseOneTag(it);

        query.tags.push(tag);
    }

    parsePayload(it, query);
}

function parsePayload(it: TokenIterator, query: InProgressQuery): string | null {
    if (!nextIsPayloadStart(it)) {
        return null;
    }

    it.consume(t_double_equals);
    it.skipSpaces();

    let str = "";

    while (!it.nextIs(t_newline) && !it.finished())
        str += it.consumeNextText();

    return query.payload = str;
}

function parseOneCommand(it: TokenIterator): Command {

    // Parse main command
    it.skipSpaces();
    if (!it.nextIs(t_ident) && !it.nextIs(t_quoted_string))
        throw new Error("expected identifier, saw: " + it.nextText());

    const command = it.consumeNextUnquotedText();

    const query: InProgressQuery = {
        tags: [],
        flags: {},
        payload: null
    }

    // Parse tag args
    parseArgs(it, query);

    return new Command(command, query.tags, query.payload, query.flags);
}

function parseOneCommandChain(it: TokenIterator): CommandChain {

    const chain = new CommandChain();

    while (!it.finished()) {
        const command = parseOneCommand(it);

        chain.commands.push(command);

        it.skipSpaces();

        if (it.finished())
            break;

        if (!it.tryConsume(t_bar))
            throw new Error("expected: |, saw: " + it.nextText());
    }

    return chain;
}

export function parseRelation(str: string): Relation {
    const it = lexStringToIterator(str);

    const query: InProgressQuery = {
        tags: [],
        flags: {},
        payload: null
    }

    parseArgs(it, query);

    if (Object.keys(query.flags).length !== 0) {
        throw new Error("didn't expect any flags in parseRelation(): " + str)
    }

    return commandTagsToRelation(query.tags as FixedTag[], query.payload);
}

export function parseTag(str: string): PatternTag {
    const it = lexStringToIterator(str);
    return parseOneTag(it);
}

export function parsePattern(str: string) {
    if (typeof str !== 'string')
        throw new Error('expected string, saw: ' + str);

    // this is silly
    return parseCommand('get ' + str).toPattern();
}

export default function parseCommand(str: string): Command {
    if (typeof str !== 'string')
        throw new Error('expected string, saw: ' + str);

    if (str.startsWith('get get '))
        throw new Error("command starts with 'get get': " + str);

    const it = lexStringToIterator(str);

    it.skipSpaces();
    if (it.nextIs(t_bar)) {
        throw new Error('parseCommand was called on a command chain: ' + str);
    }

    const command = parseOneCommand(it);

    return command;
}

export function parseCommandChain(str: string): CommandChain {
    if (typeof str !== 'string')
        throw new Error('expected string, saw: ' + str);

    if (str.startsWith('get get '))
        throw new Error("command starts with 'get get': " + str);

    const it = lexStringToIterator(str);
    const chain = parseOneCommandChain(it);

    return chain;
}
