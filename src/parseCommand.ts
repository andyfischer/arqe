
import Command from './Command'
import CommandChain from './CommandChain'
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import PatternTag, { newTagFromObject, PatternTagOptions, FixedTag } from './PatternTag'
import { parseExpr } from './parseExpr'
import { lexStringToIterator, TokenIterator, Token, t_ident, t_quoted_string, t_star,
    t_equals, t_exclamation, t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
    t_double_equals, t_dot, t_question, t_integer, t_dash, t_dollar, t_lbracket, t_rbracket,
    t_lparen, t_rparen } from './lexer'


interface InProgressQuery {
    tags: PatternTag[]
    flags: { [flag: string]: any }
}

function parseTagValue(it: TokenIterator): PatternTagOptions {
    let tagValue = null;
    let valueExpr = null;
    let starValue = false;
    let questionValue = false;
    let identifier;
    let hasValue = false;
    let parenSyntax = false;

    if (it.tryConsume(t_slash)) {
        hasValue = true;
    } else if (it.tryConsume(t_lparen)) {
        hasValue = true;
        parenSyntax = true;
    }

    if (!hasValue) {
        return {}
    }

    // Tag value

    if (it.tryConsume(t_star)) {
        starValue = true;
    } else if (it.tryConsume(t_question)) {
        questionValue = true;
    } else if (it.nextIs(t_dollar) && it.nextIs(t_ident, 1)) {
        it.consume();
        identifier = it.consumeNextUnquotedText();
        starValue = true;
    } else if (it.nextIs(t_lparen)) {
        valueExpr = parseExpr(it);
        // TODO: don't set starValue for expr
        starValue = true;
    } else {

        let iterationCount = 0;
        let parenDepth = 0;
        tagValue = '';

        while (!it.finished()) {

            if ((!parenSyntax) && (it.nextIs(t_space) || it.nextIs(t_newline)))
                break;

            if (parenSyntax && it.nextIs(t_rparen)) {
                if (parenDepth > 0)
                    parenDepth--;
                else
                    break;
            }

            if (parenSyntax && it.nextIs(t_lparen))
                parenDepth += 1;

            iterationCount += 1;
            if (iterationCount > 1000)
                throw new Error('too many iterations when parsing tag value');

            const text = it.consumeNextUnquotedText();
            tagValue += text;
        }
    }

    if (parenSyntax)
        if (!it.tryConsume(t_rparen))
            throw new Error('Expected )');

    return {
        tagValue,
        valueExpr,
        starValue,
        questionValue,
        identifier
    }
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
            return newTagFromObject({
                doubleStar: true
            });
        }

        return newTagFromObject({
            star: true,
            identifier
        });
    }

    let negate = false;

    if (it.nextIs(t_exclamation)) {
        negate = true;
        it.consume();
    }

    if (it.tryConsume(t_dot)) {
        const optionValue = it.consumeNextUnquotedText();
        return newTagFromObject({
            tagType: 'option',
            tagValue: optionValue,
            identifier,
            negate
        })
    }
    
    if (it.tryConsume(t_dollar)) {
        const unboundVar = it.consumeNextUnquotedText();
        return newTagFromObject({
            tagType: null,
            identifier: unboundVar,
            star: true
        })
    }

    const tagType = it.consumeNextUnquotedText();

    if (tagType === '/')
        throw new Error("syntax error, tagType was '/'");

    const valueOptions = parseTagValue(it);

    return newTagFromObject({
        ...valueOptions,
        tagType,
        negate,
        identifier: identifier || valueOptions.identifier,
    })
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

        if (it.finished() || it.nextIs(t_newline) || it.nextIs(t_bar))
            break;

        if (it.nextIs(t_dash)) {
            parseFlag(it, query);
            continue;
        }

        const tag = parseOneTag(it);

        query.tags.push(tag);
    }
}

function parseOneCommand(it: TokenIterator): Command {

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

    const pattern = new Pattern(query.tags);
    return new Command(command, pattern, query.flags);
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
    if (typeof str !== 'string')
        throw new Error('expected string');

    const it = lexStringToIterator(str);

    const query: InProgressQuery = {
        tags: [],
        flags: {}
    }

    parseArgs(it, query);

    if (Object.keys(query.flags).length !== 0) {
        throw new Error("didn't expect any flags in parseRelation(): " + str)
    }

    return commandTagsToRelation(query.tags as FixedTag[], null);
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

    try {
        const command = parseOneCommand(it);
        return command;
    } catch (e) {
        console.error('Error trying to parse: ' + str);
        throw e;
    }
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
