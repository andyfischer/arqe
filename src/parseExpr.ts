
import { lexStringToIterator, TokenIterator, t_lparen, t_rparen,
    t_ident, t_integer, t_slash, t_dollar } from './lexer';

export function parseExpr(it: TokenIterator): string | string[] {
    if (it.tryConsume(t_lparen)) {
        const result = [];

        while (!it.finished() && !it.nextIs(t_rparen)) {
            result.push(parseExpr(it));

            it.skipSpaces();
        }

        if (!it.tryConsume(t_rparen)) {
            throw new Error('expected )');
        }

        return result;
    }

    let text = '';
    while (it.nextIs(t_ident) || it.nextIs(t_integer) || it.nextIs(t_slash) || it.nextIs(t_dollar)) {
        text += it.consumeNextText();
    }

    if (text !== '')
        return text;

    throw new Error('unexpected s-expr atom: ' + it.nextText());
}

export function parseExprFromString(s: string) {
    const it = lexStringToIterator(s);

    return parseExpr(it);
}

type EvalFunc = (inputs: string[]) => string

const environmentBuiltins = {
    list: els => els
}

export function evalExpr(environment: {[name: string]: EvalFunc}, parsed: any[]) {
    if (parsed.length === 0)
        return null;

    const funcName = parsed[0]
    const func = environment[funcName] || environmentBuiltins[funcName];

    if (!func) {
        throw new Error("function not defined: " + func)
    }

    const applied = parsed.slice(1).map(el => {
        if (Array.isArray(el)) {
            return evalExpr(environment, el)
        } else {
            return el;
        }
    })

    return func(applied);
}

