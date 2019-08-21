
import { tokenizeString, t_newline } from './tokenizer'
import { QuerySyntax } from '.'
import { parseSyntaxLineFromTokens } from './parseSyntaxLine'

interface Options {
    filename?: string
}

export default function parseQueryInput(str: string, opts?: Options): QuerySyntax[] {

    const tokens = tokenizeString(str);
    const reader = tokens.reader;
    const queries = []

    while (!reader.finished()) {

        reader.skipWhile(token => token.match === t_newline);

        if (reader.finished())
            break;

        const pos = reader.getPosition();
        const syntax = parseSyntaxLineFromTokens(reader);

        if (pos === reader.getPosition())
            throw new Error("parser is stalled")

        if (syntax.clauses.length === 0)
            continue;

        syntax.originalStr = str.slice(syntax.sourcePos.posStart, syntax.sourcePos.posEnd);

        queries.push(syntax);
    }

    return queries;
}
