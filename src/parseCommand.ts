
import Command from './Command'
import Tuple, { newTuple } from './Tuple'
import TupleTag from './TupleTag'
import { lexStringToIterator, TokenIterator, TokenDef, t_plain_value, t_quoted_string, t_star,
    t_space, t_hash, t_newline, t_bar,
    t_integer, t_dash, t_line_comment } from './lexer'
import parseOneTag from './stringFormat/parseOneTag'

interface InProgressQuery {
    tags: TupleTag[]
    flags: { [flag: string]: any }
}

function parseArgs(it: TokenIterator, query: InProgressQuery) {
    while (true) {
        it.skipSpaces();

        if (it.finished() || it.nextIs(t_newline) || it.nextIs(t_bar))
            break;

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
    if (!it.nextIs(t_plain_value) && !it.nextIs(t_quoted_string))
        throw new Error(formatExpectedError('plain_vlue', it));

    const verb = it.consumeNextUnquotedText();

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
    return new Command(verb, pattern, query.flags);
}

export default function parseCompoundQuery(str: string): Command {

    if (typeof str !== 'string')
        throw new Error('expected string, saw: ' + str);

    if (str.startsWith('get get '))
        throw new Error("command starts with 'get get': " + str);

    const it = lexStringToIterator(str);

    it.consumeWhitespace();
    if (it.nextIs(t_bar)) {
        throw new Error('parseCompoundQuery was called on a command chain: ' + str);
    }

    try {
        const command = parseOneCommand(it);
        return command;
    } catch (e) {
        console.error('Error trying to parse: ' + str);
        throw e;
    }
}

