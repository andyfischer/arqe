
import { Clause } from '.'
import QuerySyntax from './QuerySyntax'
import { tokenizeString, TokenIterator, Token,
    t_equals, t_space, t_hash, t_double_dot, t_newline, t_bar } from '../lexer'
import SourcePos from '../types/SourcePos'

interface PipedExpr extends Expr {
    id: number
    type: 'piped'
    itemIds: number[]
    sourcePos?: SourcePos
    statementIndent?: number
}

interface ArgExpr {
    keyword?: string
    lhsName?: string
    rhsValue?: string
}

interface QueryExpr extends Expr {
    id: number
    type: 'query'
    args: ArgExpr[]
    sourcePos?: SourcePos
    statementIndent?: number
}

interface Expr {
    id: number
    type: 'piped' | 'query'
    sourcePos?: SourcePos
    isStatement?: boolean
    statementIndent?: number
}

interface ParsedQuery {
    exprs: Expr[]
}

class Context {
    originalStr: string
    result: ParsedQuery
    nextId: number = 1

    takeNextId() {
        const result = this.nextId;
        this.nextId += 1;
        return result;
    }
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
            && !it.nextIs(t_bar)
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
            && !it.nextIs(t_bar)
            && !it.nextIs(t_newline)
          ) {
        text += it.nextText();
        it.consume();
    }

    return text;
}

function toSourcePos(firstToken: Token, lastToken: Token): SourcePos {
    return {
        posStart: firstToken.startPos,
        posEnd: lastToken.startPos,
        lineStart: firstToken.lineStart,
        columnStart: lastToken.columnStart,
        lineEnd: firstToken.lineStart,
        columnEnd: lastToken.columnStart + lastToken.length
    }
}

function queryExpression(cxt: Context, it: TokenIterator): QueryExpr {
    const firstToken = it.next();

    const out: QueryExpr = {
        id: cxt.takeNextId(),
        type: 'query',
        args: []
    }

    while (!it.finished()) {

        skipSpaces(it);

        if (it.finished()
                || it.nextIs(t_newline)
                || it.nextIs(t_bar))
            break;

        if (it.nextIs(t_hash)) {
            // comment
            it.skipUntilNewline();
            break;
        }

        let keyword = null;
        let lhsName = consumeKey(it);
        let rhsValue = null;

        skipSpaces(it);

        if (it.nextIs(t_equals)) {
            it.consume(t_equals)
            skipSpaces(it);

            if (!it.finished()) {
                rhsValue = consumeOptionValue(it)
            }

            skipSpaces(it);
        } else {
            keyword = lhsName;
            lhsName = null;
        }

        out.args.push({ keyword, lhsName, rhsValue });
    }

    const lastToken = it.last();
    out.sourcePos = toSourcePos(firstToken, lastToken);
    cxt.result.exprs.push(out);
    return out;
}

function barInfixedExpression(cxt, it): Expr {
    const firstToken = it.next();

    let exprs: QueryExpr[] = [queryExpression(cxt, it)];

    while (it.nextIs(t_bar)) {
        it.consume(t_bar);
        exprs.push(queryExpression(cxt, it));
    }

    let out: QueryExpr | PipedExpr;

    if (exprs.length === 1) {
        out = exprs[0];
    } else {
        out = {
            id: cxt.takeNextId(),
            type: 'piped',
            itemIds: exprs.map(expr => expr.id)
        }
        cxt.result.exprs.push(out);
    }

    const lastToken = it.last();
    out.sourcePos = toSourcePos(firstToken, lastToken);
    return out;
}

function statement(cxt: Context, it: TokenIterator): Expr {
    const firstToken = it.next();

    // Consume first spaces as indentation
    let statementIndent = 0;
    if (it.nextIs(t_space)) {
        statementIndent = it.nextLength();
        it.consume();
    }

    const out = barInfixedExpression(cxt, it);

    out.isStatement = true;
    out.statementIndent = statementIndent;

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
    } else {
        throw new Error('unrecgonized rule: ' + rule);
    }
}

export function parseTokens(it: TokenIterator, firstRule: string) {
    const cxt = new Context();
    cxt.result = {
        exprs: []
    }

    runRule(cxt, it, firstRule);

    return cxt.result;
}

export function parseString(input: string, firstRule: string) {
    const cxt = new Context();
    const { iterator } = tokenizeString(input);
    cxt.originalStr = input;
    cxt.result = {
        exprs: []
    }

    runRule(cxt, iterator, firstRule);

    return cxt.result;
}

