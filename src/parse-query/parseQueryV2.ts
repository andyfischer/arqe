
import { Clause } from '.'
import QuerySyntax from './QuerySyntax'
import { tokenizeString, TokenIterator, Token,
    t_equals, t_space, t_hash, t_double_dot, t_newline, t_bar } from '../lexer'
import SourcePos from '../types/SourcePos'
import { ParsedQuery, Expr, QueryExpr } from '.'
import PipedExpr from './PipedExpr'

class Context {
    originalStr: string
    result: ParsedQuery
    nextId: number = 1

    takeNextId() {
        const id = this.nextId;
        this.nextId += 1;
        return id;
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

        text += it.nextUnquotedText();
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
        text += it.nextUnquotedText();
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

    const out = new QueryExpr({
        id: cxt.takeNextId(),
        type: 'query',
        args: [],
        parent: cxt.result
    })

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
    cxt.result.pushExpr(out);
    return out;
}

function barInfixedExpression(cxt: Context, it: TokenIterator): Expr {
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
        out = new PipedExpr({
            id: cxt.takeNextId(),
            type: 'piped',
            itemIds: exprs.map(expr => expr.id),
            parent: cxt.result
        })
        cxt.result.pushExpr(out);
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
    cxt.result.statementId = out.id;

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
    cxt.result = new ParsedQuery();

    runRule(cxt, it, firstRule);

    return cxt.result;
}

export function parseString(input: string, firstRule: string) {
    const cxt = new Context();
    const { iterator } = tokenizeString(input);
    cxt.originalStr = input;
    cxt.result = new ParsedQuery();

    runRule(cxt, iterator, firstRule);

    return cxt.result;
}

