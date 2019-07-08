
import { Clause, ParseContext, Query } from '.'
import QuerySyntax from './QuerySyntax'
import { tokenizeString, TokenReader, t_equals, t_space, t_hash, t_double_dot } from './tokenizer'

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

export default function stringToClauses(str: string): QuerySyntax {
    const tokens = tokenizeString(str);
    const reader = tokens.reader;

    const out: QuerySyntax = {
        clauses: [],
        originalStr: str,
        indent: 0
    }

    if (reader.nextIs(t_space)) {
        out.indent = reader.nextLength();
        reader.consume();
    }

    while (!reader.finished()) {

        skipSpaces(reader);

        if (reader.finished())
            return;

        if (reader.nextIs(t_hash)) {
            // comment, don't consume any more.
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

    return out;
}
