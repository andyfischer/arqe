
// V3 notes:
// Just emit finished queries instead of creating an AST.
// Need to port over 'parseQueryStructure' to this expression type.
// Receiver doesn't care about "piped expr", but they do care about
// receivers & senders of data.
// Might need to create an AST as a dependency tree..
// Maybe each Query needs a unique ID.

import SourcePos from '../types/SourcePos'
import { tokenizeString, TokenIterator, Token,
    t_equals, t_space, t_hash, t_double_dot, t_newline, t_bar } from '../lexer'

interface QueryArg {
    keyword?: string
    lhsName?: string
    rhsValue?: string
}

interface QueryExpr extends Expr {
    id: number
    type: 'query'
    args: QueryArg[]
    sourcePos?: SourcePos
    originalStr?: string
}

interface PipeExpr extends Expr {
    id: number
    type: 'pipe'
    pipedExprs: number[]
    sourcePos?: SourcePos
    originalStr?: string
}

interface Expr {
    id: number
    type: 'pipe' | 'query'
    sourcePos?: SourcePos
    originalStr?: string
}

interface ProgressEvent {
}

interface ParseRequest {
    text: string
    onExpr: (expr: Expr) => Promise<any>
    onProgress: (event: ProgressEvent) => Promise<any>
}

class Context {
    text: string
    req: ParseRequest
    it: TokenIterator
    nextId: number = 1

    takeNextId() {
        const id = this.nextId;
        this.nextId += 1;
        return id;
    }
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

async function queryExpression(cxt: Context) {
    const it = cxt.it;
    const firstToken = it.next();
    const id = cxt.takeNextId();

    const args: QueryArg[] = [];

    while (!it.finished()) {

        it.skipSpaces();

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

        it.skipSpaces();

        if (it.nextIs(t_equals)) {
            it.consume(t_equals)
            it.skipSpaces();

            if (!it.finished()) {
                rhsValue = consumeOptionValue(it)
            }

            it.skipSpaces();
        } else {
            keyword = lhsName;
            lhsName = null;
        }

        args.push({ keyword, lhsName, rhsValue });
    }

    let queryEndedAt = -1;

    if (it.nextIs(t_space, queryEndedAt))
        queryEndedAt -= 1;

    const sourcePos = it.toSourcePos(firstToken, it.next(queryEndedAt));
    const expr: QueryExpr = {
        id,
        type: 'query',
        args,
        sourcePos,
        originalStr: cxt.text.slice(sourcePos.posStart, sourcePos.posEnd)
    };

    await cxt.req.onExpr(expr);
    return id;
}

async function barPipeExpression(cxt: Context) {

    const it = cxt.it;
    const firstToken = it.next();
    const firstExpr = await queryExpression(cxt);
    const pipedExprs = [ firstExpr ];

    while (it.nextIs(t_bar)) {
        it.consume(t_bar);
        it.skipSpaces();
        pipedExprs.push( await queryExpression(cxt) );
        it.skipSpaces();
    }

    if (pipedExprs.length > 1) {

        const id = cxt.takeNextId();
        const sourcePos = it.toSourcePos(firstToken, it.next(-1));
        const expr: PipeExpr = {
            id,
            type: 'pipe',
            pipedExprs,
            sourcePos,
            originalStr: cxt.text.slice(sourcePos.posStart, sourcePos.posEnd)
        };

        await cxt.req.onExpr(expr);

        return id;
    }

    return firstExpr;
}

async function expression(cxt: Context) {
    return await barPipeExpression(cxt);
}

export async function parseSingleLine(req: ParseRequest) {
    const { iterator } = tokenizeString(req.text);

    const cxt = new Context();
    cxt.it = iterator;
    cxt.req = req;
    cxt.text = req.text;

    await expression(cxt);
}

export async function parseMultiLine(req: ParseRequest) {
}
