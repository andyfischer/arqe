import Tuple, { newTuple } from '../Tuple'
import TupleTag, { newTagFromObject, TagOptions, FixedTag } from '../TupleTag'
import { parseExpr } from '../parseExpr'
import { lexStringToIterator, TokenIterator, Token, TokenDef, t_ident, t_quoted_string, t_star,
    t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
    t_dot, t_question, t_integer, t_dash, t_dollar, t_lbracket, t_rbracket,
    t_lparen, t_rparen } from '../lexer'
import parseOneTag from './parseOneTag'
import { tupleBidirectionalJsonTest } from '../SelfTest'

interface InProgressQuery {
    tags: TupleTag[]
    flags: { [flag: string]: any }
}

export function parseTupleTokens(it: TokenIterator): Tuple {
    const tags = [];

    while (true) {
        it.skipSpaces();

        if (it.finished() || it.nextIs(t_newline) || it.nextIs(t_bar) || it.nextIs(t_rparen))
            break;

        const tag = parseOneTag(it);

        tags.push(tag);
    }
        
    return newTuple(tags);
}

export default function parseTuple(str: string): Tuple {
    if (typeof str !== 'string')
        throw new Error('expected string');

    const it = lexStringToIterator(str);

    try {
        const tuple = parseTupleTokens(it);

        // tupleBidirectionalJsonTest(tuple); // temp

        return tuple;
    } catch(e) {
        console.error(e);
        throw new Error('Error trying to parse tuple: ' + str);
    }
}
