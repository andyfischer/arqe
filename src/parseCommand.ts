
import Query from './Query'
import CompoundQuery from './CompoundQuery'
import Tuple, { tagsToTuple } from './Tuple'
import TupleTag from './TupleTag'
import { lexStringToIterator, TokenIterator, TokenDef, t_ident, t_quoted_string, t_star,
    t_space, t_hash, t_double_dot, t_newline, t_bar,
    t_integer, t_dash, t_line_comment } from './lexer'
import { parseOneTag } from './parseTuple'

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

function parseOneCommand(it: TokenIterator): Query {

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

    const pattern = tagsToTuple(query.tags);
    return new Query(command, pattern, query.flags);
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

function parseOneCommandChain(it: TokenIterator): CompoundQuery {

    const chain = new CompoundQuery();

    while (!it.finished()) {
        const command = parseOneCommand(it);

        chain.queries.push(command);

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


export function parseTag(str: string): TupleTag {
    const it = lexStringToIterator(str);
    return parseOneTag(it);
}

export default function parseCommand(str: string): Query {

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

export function parseCommandChain(str: string): CompoundQuery {
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

export function parseFile(fileContents: string): CompoundQuery[] {
    const it = lexStringToIterator(fileContents);

    const commands: CompoundQuery[] = [];

    while (!it.finished()) {
        while (it.nextIs(t_space) || it.nextIs(t_newline) || it.nextIs(t_line_comment))
            it.consume();

        const command = parseOneCommandChain(it);

        if (command.queries.length > 0)
            commands.push(command);
    }

    return commands;
}
