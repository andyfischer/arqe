
import { lexStringToIterator, TokenIterator, TokenDef, t_newline, t_space,
    t_line_comment, t_bar } from '../lexer'
import { parseOneCommand } from '../parseCommand'
import Query from '../Query'
import Relation from '../Relation'
import Tuple from '../Tuple'
import { parseTupleTokens } from './parseTuple'

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

function parseOneStatement(it: TokenIterator, terms: Tuple[]) {

    //let lhs = null;

    while (!it.finished()) {
        const term = parseTupleTokens(it);

        terms.push(term);

        it.skipSpaces();

        if (lookaheadPastNewlinesFor(it, t_bar)) {
            it.consumeWhitespace();
        }

        if (it.finished())
            break;

        if (!it.tryConsume(t_bar))
            break;
    }
}

function parseProgramTok(it: TokenIterator): Query {
    const terms: Tuple[] = [];

    while (!it.finished()) {
        while (it.nextIs(t_space) || it.nextIs(t_newline) || it.nextIs(t_line_comment))
            it.consume();

        if (it.finished())
            break;

        parseOneStatement(it, terms);
    }

    return new Relation(terms) as Query;
}

export function parseQuery(str: string): Query {
    const it = lexStringToIterator(str);
    const query = parseProgramTok(it);
    return query;
}
