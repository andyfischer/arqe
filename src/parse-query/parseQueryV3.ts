
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

export interface SimpleExpr extends Expr {
    id: number
    type: 'simple'
    args: QueryArg[]
    sourcePos?: SourcePos
    originalStr?: string
}

export interface PipeExpr extends Expr {
    id: number
    type: 'pipe'
    pipedExprs: number[]
    sourcePos?: SourcePos
    originalStr?: string
}

export interface Expr {
    id: number
    type: 'pipe' | 'simple'
    sourcePos?: SourcePos
    originalStr?: string
}

interface ProgressEvent {
}

interface ParseRequest {
    text: string
    onExpr?: (expr: Expr) => any
    onProgress?: (event: ProgressEvent) => Promise<any>
}

interface ParseResult {
    exprs?: Expr[]
}

class Context {
    text: string
    req: ParseRequest
    it: TokenIterator
    nextId: number = 1
    onExpr?: (expr: Expr) => any
    onProgress?: (event: ProgressEvent) => Promise<any>

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

function queryExpression(cxt: Context) {
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
    const expr: SimpleExpr = {
        id,
        type: 'simple',
        args,
        sourcePos,
        originalStr: cxt.text.slice(sourcePos.posStart, sourcePos.posEnd)
    };

    cxt.req.onExpr(expr);
    return id;
}

function barPipeExpression(cxt: Context) {

    const it = cxt.it;
    const firstToken = it.next();
    const firstExpr = queryExpression(cxt);
    const pipedExprs = [ firstExpr ];

    while (it.nextIs(t_bar)) {
        it.consume(t_bar);
        it.skipSpaces();
        pipedExprs.push( queryExpression(cxt) );
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

        cxt.req.onExpr(expr);

        return id;
    }

    return firstExpr;
}

function expression(cxt: Context) {
    return barPipeExpression(cxt);
}

export function parseSingleLine(req: ParseRequest) {
    const { iterator } = tokenizeString(req.text);

    const cxt = new Context();
    cxt.it = iterator;
    cxt.req = req;
    cxt.onExpr = req.onExpr;
    cxt.onProgress = req.onProgress;
    cxt.text = req.text;

    const result: ParseResult = {}

    if (!cxt.onExpr) {
        cxt.onExpr = (expr) => {
            result.exprs = result.exprs || [];
            result.exprs.push(expr);
        }
    }

    if (!cxt.onProgress)
        cxt.onProgress = () => null;

    expression(cxt);

    return result;
}

export async function parseMultiLine(req: ParseRequest) {
}
