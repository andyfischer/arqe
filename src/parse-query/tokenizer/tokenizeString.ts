
import StringReader from './StringReader'
import TokenIterator from './TokenIterator'
import Token from './Token'
import TokenizeResult from './TokenizeResult'
import { t_ident, t_integer, t_unrecognized, t_space, t_double_dash,
    t_double_dot, tokenFromSingleCharCode, TokenDef } from './tokens'

const c_0 = '0'.charCodeAt(0);
const c_9 = '9'.charCodeAt(0);
const c_a = 'a'.charCodeAt(0);
const c_z = 'z'.charCodeAt(0);
const c_A = 'A'.charCodeAt(0);
const c_Z = 'Z'.charCodeAt(0);
const c_dash = '-'.charCodeAt(0);
const c_under = '_'.charCodeAt(0);
const c_space = ' '.charCodeAt(0);
const c_dot = '.'.charCodeAt(0);
const c_newline = '\n'.charCodeAt(0);

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

function consumeNumber(input: StringReader) {
    // todo, handle floats

    return input.consumeWhile(t_integer, isDigit);
}

function consumeNext(input: StringReader) {
    const c: number = input.next(0);

    if (canStartIdentifier(c))
        return input.consumeWhile(t_ident, canContinueIdentifier);

    if (c === c_space)
        return input.consumeWhile(t_space, c => c === c_space);

    if (isDigit(c))
        return consumeNumber(input);

    if (c === c_dash && input.next(1) === c_dash)
        return input.consume(t_double_dash, 2);

    if (c === c_dot && input.next(1) === c_dot)
        return input.consume(t_double_dot, 2);

    if (tokenFromSingleCharCode[c])
        return input.consume(tokenFromSingleCharCode[c], 1);

    return input.consume(t_unrecognized, 1);
}

export function tokenizeString(str:string ): TokenizeResult {
    const reader = new StringReader(str);

    const tokens = [];

    while (!reader.finished()) {

        const pos = reader.index;

        tokens.push(consumeNext(reader));

        if (reader.index === pos) {
            throw new Error(`internal error: reader stalled at index `
                            +`${reader.index} (next char is ${reader.nextChar(0)}`);
        }
    }

    const result = new TokenizeResult(str);
    result.tokens = tokens;
    result.iterator = new TokenIterator(tokens);
    result.iterator.result = result;
    return result;
}
