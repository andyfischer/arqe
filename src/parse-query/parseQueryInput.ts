
import { tokenizeString, t_newline } from '../lexer'
import { QuerySyntax } from '.'
import { parseSyntaxLineFromTokens } from './parseSyntaxLine'

interface Options {
    filename?: string
}

export default function parseQueryInput(str: string, opts?: Options): QuerySyntax[] {

    const tokens = tokenizeString(str);
    const it = tokens.iterator;
    const queries = []

    while (!it.finished()) {

        it.skipWhile(token => token.match === t_newline);

        if (it.finished())
            break;

        const pos = it.getPosition();
        const syntax = parseSyntaxLineFromTokens(it);

        if (pos === it.getPosition())
            throw new Error("parser is stalled")

        if (syntax.clauses.length === 0)
            continue;

        syntax.originalStr = str.slice(syntax.sourcePos.posStart, syntax.sourcePos.posEnd);

        queries.push(syntax);
    }

    return queries;
}
