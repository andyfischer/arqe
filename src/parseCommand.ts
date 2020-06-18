
import Command from './Command'
import CommandChain from './CommandChain'
import Tuple, { tagsToTuple } from './Tuple'
import Pattern from './Pattern'
import PatternTag, { newTagFromObject, TagOptions, FixedTag } from './PatternTag'
import { parseExpr } from './parseExpr'
import { lexStringToIterator, TokenIterator, Token, TokenDef, t_ident, t_quoted_string, t_star,
    t_equals, t_exclamation, t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
    t_double_equals, t_dot, t_question, t_integer, t_dash, t_dollar, t_lbracket, t_rbracket,
    t_lparen, t_rparen } from './lexer'

interface InProgressQuery {
    tags: PatternTag[]
    flags: { [flag: string]: any }
}

function parseOneTag(it: TokenIterator): PatternTag {

    let identifier;

    // Identifier prefix
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

    if (it.tryConsume(t_dot)) {
        const optionValue = it.consumeNextUnquotedText();
        return newTagFromObject({
            attr: 'option',
            tagValue: optionValue,
            identifier,
        })
    }
    
    if (it.tryConsume(t_dollar)) {
        const unboundVar = it.consumeNextUnquotedText();
        return newTagFromObject({
            attr: null,
            identifier: unboundVar,
            star: true
        })
    }

    const attr = it.consumeNextUnquotedText();

    if (attr === '/')
        throw new Error("syntax error, attr was '/'");

    let optional = null;

    if (it.tryConsume(t_question)) {
        optional = true;
    }

    const valueOptions = parseTagValue(it);

    return newTagFromObject({
        ...valueOptions,
        attr,
        optional,
        identifier: identifier || valueOptions.identifier,
    })
}

function parseTagValue(it: TokenIterator): TagOptions {
    let tagValue = null;
    let valueExpr = null;
    let starValue = false;
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

    if (!parenSyntax && it.tryConsume(t_star)) {
        starValue = true;
    } else if (!parenSyntax && it.nextIs(t_dollar) && it.nextIs(t_ident, 1)) {
        it.consume();
        identifier = it.consumeNextUnquotedText();
        starValue = true;
    } else if (it.nextIs(t_lparen)) {
        valueExpr = parseExpr(it);
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

function formatExpectedError(expected: string, it: TokenIterator) {
    return `expected ${expected}, saw: "${it.nextText()}" (${it.next().match.name})`
}

function parseOneCommand(it: TokenIterator): Command {

    // Parse main command
    it.skipSpaces();
    if (!it.nextIs(t_ident) && !it.nextIs(t_quoted_string))
        throw new Error(formatExpectedError('identifier', it));

    const command = it.consumeNextUnquotedText();

    const query: InProgressQuery = {
        tags: [],
        flags: {}
    }

    // Parse tag args
    parseArgs(it, query);

    const pattern = tagsToTuple(query.tags);
    return new Command(command, pattern, query.flags);
}

function lookaheadPastNewlinesFor(it: TokenIterator, match: TokenDef) {
    let lookahead = 0;

    while (!it.finished(lookahead)) {
        if (it.nextIs(match, lookahead))
            return true;

        if (it.nextIs(t_newline, lookahead) || it.nextIs(t_space, lookahead)) {
            lookahead += 1;
            continue;
        }
        
        break;
    }

    return false;
}

function parseOneCommandChain(it: TokenIterator): CommandChain {

    const chain = new CommandChain();

    while (!it.finished()) {
        const command = parseOneCommand(it);

        chain.commands.push(command);

        it.skipSpaces();

        if (lookaheadPastNewlinesFor(it, t_bar)) {
            it.consumeWhitespace();
        }

        if (it.finished())
            break;

        if (!it.tryConsume(t_bar))
            break;
    }

    return chain;
}

export function parseTuple(str: string): Tuple {
    if (typeof str !== 'string')
        throw new Error('expected string');

    const it = lexStringToIterator(str);

    const query: InProgressQuery = {
        tags: [],
        flags: {}
    }

    try {
        parseArgs(it, query);
    } catch(e) {
        console.error(e);
        throw new Error('Error trying to parse relation: ' + str);
    }

    if (Object.keys(query.flags).length !== 0) {
        throw new Error("didn't expect any flags in parseRelation(): " + str)
    }

    return tagsToTuple(query.tags as FixedTag[]);
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

    it.consumeWhitespace();
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

    try {
        const it = lexStringToIterator(str);
        const chain = parseOneCommandChain(it);
        return chain;
    } catch (e) {
        console.log(`Uncaught exception in parseCommandChain for command (${str}): ` + (e.stack || e))
        throw e;
    }
}

export function parseFile(fileContents: string): CommandChain[] {
    const it = lexStringToIterator(fileContents);

    const commands: CommandChain[] = [];

    while (!it.finished()) {
        while (it.nextIs(t_space) || it.nextIs(t_newline))
            it.consume();

        const command = parseOneCommandChain(it);

        if (command.commands.length > 0)
            commands.push(command);
    }

    return commands;
}
