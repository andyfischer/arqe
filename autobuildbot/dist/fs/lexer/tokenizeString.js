"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = __importDefault(require("./Context"));
const TokenIterator_1 = __importDefault(require("./TokenIterator"));
const LexedText_1 = __importDefault(require("./LexedText"));
const tokens_1 = require("./tokens");
const c_0 = '0'.charCodeAt(0);
const c_9 = '9'.charCodeAt(0);
const c_a = 'a'.charCodeAt(0);
const c_z = 'z'.charCodeAt(0);
const c_A = 'A'.charCodeAt(0);
const c_Z = 'Z'.charCodeAt(0);
const c_dash = '-'.charCodeAt(0);
const c_under = '_'.charCodeAt(0);
const c_space = ' '.charCodeAt(0);
const c_equals = '='.charCodeAt(0);
const c_dot = '.'.charCodeAt(0);
const c_newline = '\n'.charCodeAt(0);
const c_hash = '#'.charCodeAt(0);
const c_single_quote = "'".charCodeAt(0);
const c_double_quote = "\"".charCodeAt(0);
const c_backslash = '\\'.charCodeAt(0);
function isLowerCase(c) {
    return c >= c_a && c <= c_z;
}
function isUpperCase(c) {
    return c >= c_A && c <= c_Z;
}
function isDigit(c) {
    return c >= c_0 && c <= c_9;
}
function canStartIdentifier(c) {
    return isLowerCase(c) || isUpperCase(c) || c === c_under;
}
function canContinueIdentifier(c) {
    return (isLowerCase(c) || isUpperCase(c) || isDigit(c)
        || c === c_dash
        || c === c_under);
}
function consumeNumber(input) {
    return input.consumeWhile(tokens_1.t_integer, isDigit);
}
function consumeQuotedString(input, lookingFor) {
    let lookahead = 1;
    while (true) {
        if (input.finished(lookahead))
            break;
        if (input.next(lookahead) === c_backslash) {
            lookahead += 2;
            continue;
        }
        if (input.next(lookahead) === lookingFor) {
            lookahead += 1;
            break;
        }
        lookahead += 1;
    }
    return input.consume(tokens_1.t_quoted_string, lookahead);
}
function consumeNext(input) {
    const c = input.next(0);
    if (canStartIdentifier(c))
        return input.consumeWhile(tokens_1.t_ident, canContinueIdentifier);
    if (c === c_hash)
        return input.consumeWhile(tokens_1.t_line_comment, c => c !== c_newline);
    if (c === c_space)
        return input.consumeWhile(tokens_1.t_space, c => c === c_space);
    if (isDigit(c))
        return consumeNumber(input);
    if (c === c_equals && input.next(1) === c_equals)
        return input.consume(tokens_1.t_double_equals, 2);
    if (c === c_dash && input.next(1) === c_dash)
        return input.consume(tokens_1.t_double_dash, 2);
    if (c === c_dot && input.next(1) === c_dot)
        return input.consume(tokens_1.t_double_dot, 2);
    if (tokens_1.tokenFromSingleCharCode[c])
        return input.consume(tokens_1.tokenFromSingleCharCode[c], 1);
    return input.consume(tokens_1.t_unrecognized, 1);
}
function tokenizeString(str) {
    const context = new Context_1.default(str);
    while (!context.finished()) {
        const pos = context.index;
        context.resultTokens.push(consumeNext(context));
        if (context.index === pos) {
            throw new Error(`internal error: lexer stalled at index `
                + `${context.index} (next char is ${context.nextChar(0)}`);
        }
    }
    const result = new LexedText_1.default(str);
    result.tokens = context.resultTokens;
    result.iterator = new TokenIterator_1.default(context.resultTokens);
    result.iterator.result = result;
    return result;
}
exports.tokenizeString = tokenizeString;
function lexStringToIterator(str) {
    const { iterator } = tokenizeString(str);
    return iterator;
}
exports.lexStringToIterator = lexStringToIterator;
//# sourceMappingURL=tokenizeString.js.map