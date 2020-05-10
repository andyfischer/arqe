"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("../lexer");
const parseSyntaxLine_1 = require("./parseSyntaxLine");
function parseQueryInput(str, opts) {
    const tokens = lexer_1.tokenizeString(str);
    const it = tokens.iterator;
    const queries = [];
    while (!it.finished()) {
        it.skipWhile(token => (token.match === lexer_1.t_newline || token.match === lexer_1.t_line_comment));
        if (it.finished())
            break;
        const pos = it.getPosition();
        const syntax = parseSyntaxLine_1.parseSyntaxLineFromTokens(it);
        if (pos === it.getPosition())
            throw new Error("parser is stalled");
        if (syntax.clauses.length === 0)
            continue;
        syntax.originalStr = str.slice(syntax.sourcePos.posStart, syntax.sourcePos.posEnd);
        queries.push(syntax);
    }
    return queries;
}
exports.default = parseQueryInput;
//# sourceMappingURL=parseQueryInput.js.map