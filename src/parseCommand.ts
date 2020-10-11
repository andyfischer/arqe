
import Command from './Command'
import Tuple, { newTuple } from './Tuple'
import TupleTag from './TupleTag'
import { lexStringToIterator, TokenIterator, TokenDef, t_ident, t_quoted_string, t_star,
    t_space, t_hash, t_double_dot, t_newline, t_bar,
    t_integer, t_dash, t_line_comment } from './lexer'
import parseOneTag from './stringFormat/parseOneTag'

interface InProgressQuery {
    tags: TupleTag[]
    flags: { [flag: string]: any }
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

export function parseOneCommand(it: TokenIterator): Command {

    const startPos = it.position;

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
    try {
        parseArgs(it, query);
    } catch (e) {
        throw new Error(`Parse error on: \n`
        +`  ${it.spanToString(startPos, it.position)}\n`
        +`  ${e}`
        )
    }

    const pattern = newTuple(query.tags);
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

export function parseTag(str: string): TupleTag {
    const it = lexStringToIterator(str);
    return parseOneTag(it);
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

export function parsePattern(query: string) {
    const parsed = parseCommand('get ' + query);
    return parsed.tuple;
}
