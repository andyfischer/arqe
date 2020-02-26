
import { lexStringToIterator, TokenIterator, Token, t_lparen, t_rparen,
    t_ident, t_integer} from './lexer';

function expr(it: TokenIterator) {
    if (it.tryConsume(t_lparen)) {
        const result = [];

        while (!it.finished() && !it.nextIs(t_rparen)) {

            result.push(expr(it));

            it.skipSpaces();
        }

        if (!it.tryConsume(t_rparen)) {
            throw new Error('expected )');
        }

        return result;
    }

    if (it.nextIs(t_ident) || it.nextIs(t_integer)) {
        return it.consumeNextText();
    }

    throw new Error('unexpected s-expr atom: ' + it.nextText());
}

export function parseSexprFromString(s: string) {
    const it = lexStringToIterator(s);

    return expr(it);
}

type EvalFunc = (inputs: string[]) => string

const environmentBuiltins = {
    list: els => els
}

export function evalSexpr(environment: {[name: string]: EvalFunc}, parsed: any[]) {
    if (parsed.length === 0)
        return null;

    const funcName = parsed[0]
    const func = environment[funcName] || environmentBuiltins[funcName];

    if (!func) {
        throw new Error("function not defined: " + func)
    }

    const applied = parsed.slice(1).map(el => {
        if (Array.isArray(el)) {
            return evalSexpr(environment, el)
        } else {
            return el;
        }
    })

    return func(applied);
}