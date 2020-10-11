
import { lexStringToIterator, TokenIterator, TokenDef, t_newline, t_space,
    t_line_comment, t_bar } from '../lexer'
import { parseOneCommand } from '../parseCommand'
import Query from '../Query'

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

function parseOneStatement(it: TokenIterator, program: Query) {

    let lhs = null;

    while (!it.finished()) {
        const command = parseOneCommand(it);

        const term = program.addTerm(command.verb, command.tuple, command.flags);
        if (lhs) {
            program.connectAsInput(lhs, term);
        }
        lhs = term;

        it.skipSpaces();

        if (lookaheadPastNewlinesFor(it, t_bar)) {
            it.consumeWhitespace();
        }

        if (it.finished())
            break;

        if (!it.tryConsume(t_bar))
            break;
    }

    program.setOutput(lhs);
}

function parseProgramTok(it: TokenIterator): Query {
    const query = new Query();

    while (!it.finished()) {
        while (it.nextIs(t_space) || it.nextIs(t_newline) || it.nextIs(t_line_comment))
            it.consume();

        if (it.finished())
            break;

        parseOneStatement(it, query);
    }

    return query;
}

export function parseQuery(str: string): Query {
    const it = lexStringToIterator(str);
    
    const query = parseProgramTok(it);

    if (!query.outputFrom) {
        console.log('warning: parsed query has no output: ' + str);
    }

    return query;
}
