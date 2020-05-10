"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("./lexer");
function expr(it) {
    if (it.tryConsume(lexer_1.t_lparen)) {
        const result = [];
        while (!it.finished() && !it.nextIs(lexer_1.t_rparen)) {
            result.push(expr(it));
            it.skipSpaces();
        }
        if (!it.tryConsume(lexer_1.t_rparen)) {
            throw new Error('expected )');
        }
        return result;
    }
    let text = '';
    while (it.nextIs(lexer_1.t_ident) || it.nextIs(lexer_1.t_integer) || it.nextIs(lexer_1.t_slash)) {
        text += it.consumeNextText();
    }
    if (text !== '')
        return text;
    throw new Error('unexpected s-expr atom: ' + it.nextText());
}
function parseSexprFromString(s) {
    const it = lexer_1.lexStringToIterator(s);
    return expr(it);
}
exports.parseSexprFromString = parseSexprFromString;
const environmentBuiltins = {
    list: els => els
};
function evalSexpr(environment, parsed) {
    if (parsed.length === 0)
        return null;
    const funcName = parsed[0];
    const func = environment[funcName] || environmentBuiltins[funcName];
    if (!func) {
        throw new Error("function not defined: " + func);
    }
    const applied = parsed.slice(1).map(el => {
        if (Array.isArray(el)) {
            return evalSexpr(environment, el);
        }
        else {
            return el;
        }
    });
    return func(applied);
}
exports.evalSexpr = evalSexpr;
//# sourceMappingURL=sexpr.js.map