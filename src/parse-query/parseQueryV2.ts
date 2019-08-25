
import { Clause } from '.'
import QuerySyntax from './QuerySyntax'
import { tokenizeString, TokenIterator, t_equals, t_space, t_hash, t_double_dot, t_newline } from '../lexer'

interface PipesExpr {
    itemIds: number[]
}

interface ArgExpr {
    field?: string
    rhsValue?: string
}

interface QueryExpr {
    args: ArgExpr[]

}

interface ParsedQueryItem {
    id: number
    nestLevel: 'statement' | 'subexpr'
    type: 'query' | 'pipes'
    pipesExpr?: PipesExpr
    queryExpr?: QueryExpr
}

interface ParsedQuery {
    items: ParsedQueryItem[]
}

class Context {
    originalStr: string
    result: ParsedQuery
    nextId: number = 1
}

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

        text += it.nextText();
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
        text += it.nextText();
        it.consume();
    }

    return text;
}

export function statement(cxt: Context, it: TokenIterator): QuerySyntax {
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

function statementsFile(cxt: Context, it: TokenIterator) {
    while (!it.finished()) {
        it.skipWhile(token => token.match === t_newline);

        if (it.finished())
            break;

        const pos = it.getPosition();
        statement(cxt, it);

        if (pos === it.getPosition())
            throw new Error("parser is stalled")
    }
}

function runRule(cxt: Context, it: TokenIterator, rule: string) {
    if (rule === 'statement') {
        statement(cxt, it)
    } else if (rule === 'statements-file') {
        statementsFile(cxt, it);
    }
}

export function parseTokens(it: TokenIterator, firstRule: string) {
    const cxt = new Context();
    cxt.result = {
        items: []
    }

    runRule(cxt, it, firstRule);
}

export function parseString(input: string, firstRule: string) {
    const cxt = new Context();
    const { iterator } = tokenizeString(input);
    cxt.originalStr = input;
    cxt.result = {
        items: []
    }

    runRule(cxt, iterator, firstRule);
}

