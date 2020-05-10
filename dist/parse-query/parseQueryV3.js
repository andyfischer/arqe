"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("../lexer");
class Context {
    constructor() {
        this.nextId = 1;
    }
    takeNextId() {
        const id = this.nextId;
        this.nextId += 1;
        return id;
    }
}
function consumeKey(it) {
    let text = '';
    while (!it.finished()
        && !it.nextIs(lexer_1.t_space)
        && !it.nextIs(lexer_1.t_newline)
        && !it.nextIs(lexer_1.t_bar)
        && !it.nextIs(lexer_1.t_equals)) {
        text += it.nextUnquotedText();
        it.consume();
    }
    return text;
}
function consumeOptionValue(it) {
    let text = '';
    while (!it.finished()
        && !it.nextIs(lexer_1.t_space)
        && !it.nextIs(lexer_1.t_bar)
        && !it.nextIs(lexer_1.t_newline)) {
        text += it.nextUnquotedText();
        it.consume();
    }
    return text;
}
function queryExpression(cxt) {
    const it = cxt.it;
    const firstToken = it.next();
    const id = cxt.takeNextId();
    const args = [];
    while (!it.finished()) {
        it.skipSpaces();
        if (it.finished()
            || it.nextIs(lexer_1.t_newline)
            || it.nextIs(lexer_1.t_bar))
            break;
        if (it.nextIs(lexer_1.t_hash)) {
            it.skipUntilNewline();
            break;
        }
        let keyword = null;
        let lhsName = consumeKey(it);
        let rhsValue = null;
        it.skipSpaces();
        if (it.nextIs(lexer_1.t_equals)) {
            it.consume(lexer_1.t_equals);
            it.skipSpaces();
            if (!it.finished()) {
                rhsValue = consumeOptionValue(it);
            }
            it.skipSpaces();
        }
        else {
            keyword = lhsName;
            lhsName = null;
        }
        args.push({ keyword, lhsName, rhsValue });
    }
    let queryEndedAt = -1;
    if (it.nextIs(lexer_1.t_space, queryEndedAt))
        queryEndedAt -= 1;
    const sourcePos = it.toSourcePos(firstToken, it.next(queryEndedAt));
    const expr = {
        id,
        type: 'simple',
        args,
        sourcePos,
        originalStr: cxt.text.slice(sourcePos.posStart, sourcePos.posEnd)
    };
    cxt.req.onExpr(expr);
    return id;
}
function barPipeExpression(cxt) {
    const it = cxt.it;
    const firstToken = it.next();
    const firstExpr = queryExpression(cxt);
    const pipedExprs = [firstExpr];
    while (it.nextIs(lexer_1.t_bar)) {
        it.consume(lexer_1.t_bar);
        it.skipSpaces();
        pipedExprs.push(queryExpression(cxt));
        it.skipSpaces();
    }
    if (pipedExprs.length > 1) {
        const id = cxt.takeNextId();
        const sourcePos = it.toSourcePos(firstToken, it.next(-1));
        const expr = {
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
function expression(cxt) {
    return barPipeExpression(cxt);
}
function expressionLines(cxt) {
    while (true) {
        cxt.it.skipWhile(t => t.match === lexer_1.t_newline || t.match === lexer_1.t_space);
        if (cxt.it.finished())
            break;
        const pos = cxt.it.getPosition();
        expression(cxt);
        if (pos === cxt.it.getPosition()) {
            throw new Error('internal error: parser is stalled');
        }
    }
}
function parseQueries(req) {
    const { iterator } = lexer_1.tokenizeString(req.text);
    const cxt = new Context();
    cxt.it = iterator;
    cxt.req = req;
    cxt.onExpr = req.onExpr;
    cxt.onProgress = req.onProgress;
    cxt.text = req.text;
    const result = {};
    if (!cxt.onExpr) {
        cxt.onExpr = (expr) => {
            result.exprs = result.exprs || [];
            result.exprs.push(expr);
        };
    }
    if (!cxt.onProgress)
        cxt.onProgress = () => null;
    expressionLines(cxt);
    return result;
}
exports.parseQueries = parseQueries;
function parseAsOneSimple(text) {
    let result = null;
    let error = null;
    parseQueries({
        text,
        onExpr(expr) {
            if (error)
                return;
            if (expr.type === 'simple') {
                if (result) {
                    error = new Error("parseAsOneSimple: found two expressions");
                    return;
                }
                result = expr;
                return;
            }
            error = new Error("parseAsOneSimple: found unexpected expression type: " + expr.type);
        }
    });
    if (error)
        throw error;
    if (!result)
        throw new Error("parseAsOneSimple: no expression found");
    return result;
}
exports.parseAsOneSimple = parseAsOneSimple;
//# sourceMappingURL=parseQueryV3.js.map