
import { tokenizeString } from './tokenizer'
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

        const pos = reader.getPosition();
        const syntax = parseSyntaxLineFromTokens(reader);

        if (pos === reader.getPosition())
            throw new Error("parser is stalled")

        if (syntax.clauses.length === 0)
            continue;

        queries.push(syntax);
    }

    return queries;
}
