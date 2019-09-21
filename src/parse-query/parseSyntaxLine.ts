
import { Clause } from '.'
import QuerySyntax from './QuerySyntax'
import { tokenizeString, TokenIterator, t_equals, t_space, t_hash, t_double_dot, t_newline } from '../lexer'

function skipSpaces(it: TokenIterator) {
    while (it.nextIs(t_space))
        it.consume(t_space);
}

function consumeKey(it: TokenIterator) {
    let text = '';

    while (!it.finished()
            && !it.nextIs(t_space)
            && !it.nextIs(t_newline)
            && !it.nextIs(t_equals)) {

        text += it.nextUnquotedText();
        it.consume();
    }

    return text;
}

function consumeOptionValue(it: TokenIterator) {
    let text = '';

    while (!it.finished()
            && !it.nextIs(t_space)
            && !it.nextIs(t_newline)
          ) {
        text += it.nextUnquotedText();
        it.consume();
    }

    return text;
}

export function parseSyntaxLineFromTokens(it: TokenIterator): QuerySyntax {
    const nextToken = it.next();

    const out: QuerySyntax = {
        clauses: [],
        originalStr: '',
        indent: 0,
        sourcePos: {
            posStart: nextToken.startPos,
            posEnd: nextToken.startPos,
            lineStart: nextToken.lineStart,
            columnStart: nextToken.columnStart,
            lineEnd: nextToken.lineStart,
            columnEnd: nextToken.columnStart
        }
    }

    // Consume first spaces as indentation
    if (it.nextIs(t_space)) {
        out.indent = it.nextLength();
        it.consume();
    }

    let activeQuote = null;

    while (!it.finished()) {

        if (activeQuote) {
            // todo, handle quotes
        }

        skipSpaces(it);

        if (it.finished() || it.nextIs(t_newline))
            break;

        if (it.nextIs(t_hash)) {
            // comment
            it.skipUntilNewline();
            break;
        }

        if (it.nextIs(t_double_dot)) {
            it.consume(t_double_dot);
            out.clauses.push({ isDots: true });
            out.incomplete = true;
            continue;
        }

        const key = consumeKey(it);
        let assignVal;

        skipSpaces(it);

        if (it.nextIs(t_equals)) {
            it.consume(t_equals)
            skipSpaces(it);

            if (!it.finished()) {
                assignVal = consumeOptionValue(it)
            }

            skipSpaces(it);
        }

        out.clauses.push({ key, assignVal });
    }

    const lastToken = it.last();
    out.sourcePos.posEnd = lastToken.endPos;
    out.sourcePos.lineEnd = lastToken.lineStart;
    out.sourcePos.columnEnd = lastToken.columnStart + lastToken.length;

    return out;
}

export default function parseSyntaxLine(str: string) {
    const tokens = tokenizeString(str);
    const it = tokens.iterator;

    return parseSyntaxLineFromTokens(it);
}
