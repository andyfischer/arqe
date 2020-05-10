"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("../lexer");
function skipSpaces(it) {
    while (it.nextIs(lexer_1.t_space))
        it.consume(lexer_1.t_space);
}
function consumeKey(it) {
    let text = '';
    while (!it.finished()
        && !it.nextIs(lexer_1.t_space)
        && !it.nextIs(lexer_1.t_newline)
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
        && !it.nextIs(lexer_1.t_newline)) {
        text += it.nextUnquotedText();
        it.consume();
    }
    return text;
}
function parseSyntaxLineFromTokens(it) {
    const nextToken = it.next();
    const out = {
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
    };
    if (it.nextIs(lexer_1.t_space)) {
        out.indent = it.nextLength();
        it.consume();
    }
    let activeQuote = null;
    while (!it.finished()) {
        if (activeQuote) {
        }
        skipSpaces(it);
        if (it.finished() || it.nextIs(lexer_1.t_newline))
            break;
        if (it.nextIs(lexer_1.t_hash)) {
            it.skipUntilNewline();
            break;
        }
        if (it.nextIs(lexer_1.t_double_dot)) {
            it.consume(lexer_1.t_double_dot);
            out.clauses.push({ isDots: true });
            out.incomplete = true;
            continue;
        }
        const key = consumeKey(it);
        let assignVal;
        skipSpaces(it);
        if (it.nextIs(lexer_1.t_equals)) {
            it.consume(lexer_1.t_equals);
            skipSpaces(it);
            if (!it.finished()) {
                assignVal = consumeOptionValue(it);
            }
            skipSpaces(it);
        }
        out.clauses.push({ key, assignVal });
    }
    const lastToken = it.next(-1);
    out.sourcePos.posEnd = lastToken.endPos;
    out.sourcePos.lineEnd = lastToken.lineStart;
    out.sourcePos.columnEnd = lastToken.columnStart + lastToken.length;
    return out;
}
exports.parseSyntaxLineFromTokens = parseSyntaxLineFromTokens;
function parseSyntaxLine(str) {
    const tokens = lexer_1.tokenizeString(str);
    const it = tokens.iterator;
    return parseSyntaxLineFromTokens(it);
}
exports.default = parseSyntaxLine;
//# sourceMappingURL=parseSyntaxLine.js.map