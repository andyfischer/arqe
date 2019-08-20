
import { Clause } from '.'
import QuerySyntax from './QuerySyntax'
import { tokenizeString, TokenReader, t_equals, t_space, t_hash, t_double_dot } from './tokenizer'
import { print } from '../utils'

function skipSpaces(reader: TokenReader) {
    while (reader.nextIs(t_space))
        reader.consume(t_space);
}

function consumeKey(reader: TokenReader) {
    let text = '';

    while (!reader.finished()
            && !reader.nextIs(t_space)
            && !reader.nextIs(t_equals)) {

        text += reader.nextText();
        reader.consume();
    }

    return text;
}

function consumeOptionValue(reader: TokenReader) {
    let text = '';

    while (!reader.finished()
            && !reader.nextIs(t_space)) {
        text += reader.nextText();
        reader.consume();
    }

    return text;
}

export function parseSyntaxLineFromTokens(reader: TokenReader): QuerySyntax {
    const nextToken = reader.next();

    const out: QuerySyntax = {
        clauses: [],
        originalStr: '',
        indent: 0,
        sourcePos: {
            lineStart: nextToken.lineStart,
            columnStart: nextToken.columnStart,
            lineEnd: nextToken.lineStart,
            columnEnd: nextToken.columnStart
        }
    }

    // Consume first spaces as indentation
    if (reader.nextIs(t_space)) {
        out.indent = reader.nextLength();
        reader.consume();
    }

    let activeQuote = null;

    while (!reader.finished()) {

        if (activeQuote) {
            // todo, handle quotes
        }

        skipSpaces(reader);

        if (reader.finished())
            break;

        if (reader.nextIs(t_hash)) {
            // comment
            reader.skipUntilNewline();
            break;
        }

        if (reader.nextIs(t_double_dot)) {
            reader.consume(t_double_dot);
            out.clauses.push({ isDots: true });
            out.incomplete = true;
            continue;
        }

        const key = consumeKey(reader);
        let assignVal;

        skipSpaces(reader);

        if (reader.nextIs(t_equals)) {
            reader.consume(t_equals)
            skipSpaces(reader);

            if (!reader.finished()) {
                assignVal = consumeOptionValue(reader)
            }

            skipSpaces(reader);
        }

        out.clauses.push({ key, assignVal });
    }

    const lastToken = reader.last();
    out.sourcePos.lineEnd = lastToken.lineStart;
    out.sourcePos.columnEnd = lastToken.columnStart + lastToken.length;

    return out;
}

export default function parseSyntaxLine(str: string) {
    const tokens = tokenizeString(str);
    const reader = tokens.reader;

    return parseSyntaxLineFromTokens(reader);
}
