import Tuple, { tagsToTuple } from './Tuple'
import TupleTag, { newTagFromObject, TagOptions, FixedTag } from './TupleTag'
import { parseExpr } from './parseExpr'
import { lexStringToIterator, TokenIterator, Token, TokenDef, t_ident, t_quoted_string, t_star,
    t_space, t_hash, t_double_dot, t_newline, t_bar, t_slash,
    t_dot, t_question, t_integer, t_dash, t_dollar, t_lbracket, t_rbracket,
    t_lparen, t_rparen } from './lexer'

interface InProgressQuery {
    tags: TupleTag[]
    flags: { [flag: string]: any }
}

export function parseOneTag(it: TokenIterator): TupleTag {

    let identifier;

    // Identifier prefix
    if (it.tryConsume(t_lbracket)) {
        if (!it.nextIs(t_ident) || it.nextText() !== 'from')
            throw new Error("expected 'from', found: " + it.nextText());

        it.consume();
        it.skipSpaces();
        if (!it.tryConsume(t_dollar))
            throw new Error("expected '$', found: " + it.nextText());

        identifier = it.consumeNextText();

        if (!it.tryConsume(t_rbracket))
            throw new Error("expected ']', found: " + it.nextText());

        it.skipSpaces();
    }

    if (it.tryConsume(t_star)) {
        if (it.tryConsume(t_star)) {
            return newTagFromObject({
                doubleStar: true
            });
        }

        return newTagFromObject({
            star: true,
            identifier
        });
    }

    if (it.tryConsume(t_dollar)) {
        const unboundVar = it.consumeNextUnquotedText();
        return newTagFromObject({
            attr: null,
            identifier: unboundVar,
            star: true
        })
    }

    // Attribute
    let attr = it.consumeNextUnquotedText();
    while (it.nextIs(t_ident) || it.nextIs(t_dot))
        attr += it.consumeNextUnquotedText();

    if (attr === '/')
        throw new Error("syntax error, attr was '/'");

    let optional = null;

    if (it.tryConsume(t_question)) {
        optional = true;
    }

    const valueOptions = parseTagValue(it);

    return newTagFromObject({
        ...valueOptions,
        attr,
        optional,
        identifier: identifier || valueOptions.identifier,
    })
}

function parseTagValue(it: TokenIterator): TagOptions {
    let tagValue = null;
    let valueExpr = null;
    let starValue = false;
    let identifier;
    let hasValue = false;
    let parenSyntax = false;

    if (it.tryConsume(t_slash)) {
        hasValue = true;
    } else if (it.tryConsume(t_lparen)) {
        hasValue = true;
        parenSyntax = true;
    }

    if (!hasValue) {
        return {}
    }

    // Tag value

    if (!parenSyntax && it.tryConsume(t_star)) {
        starValue = true;
    } else if (!parenSyntax && it.nextIs(t_dollar) && it.nextIs(t_ident, 1)) {
        it.consume();
        identifier = it.consumeNextUnquotedText();
        // starValue = true;
    } else if (it.nextIs(t_lparen)) {
        valueExpr = parseExpr(it);
    } else {

        let iterationCount = 0;
        let parenDepth = 0;
        tagValue = '';

        while (!it.finished()) {

            if ((!parenSyntax) && (it.nextIs(t_space) || it.nextIs(t_newline)))
                break;

            if (parenSyntax && it.nextIs(t_rparen)) {
                if (parenDepth > 0)
                    parenDepth--;
                else
                    break;
            }

            if (parenSyntax && it.nextIs(t_lparen))
                parenDepth += 1;

            iterationCount += 1;
            if (iterationCount > 1000)
                throw new Error('too many iterations when parsing tag value');

            const text = it.consumeNextUnquotedText();

            tagValue += text;
        }
    }

    if (parenSyntax)
        if (!it.tryConsume(t_rparen))
            throw new Error('Expected )');

    return {
        value: tagValue,
        exprValue: valueExpr,
        starValue,
        identifier
    }
}

function parseTags(it: TokenIterator) {
    const tags = [];

    while (true) {
        it.skipSpaces();

        if (it.finished() || it.nextIs(t_newline) || it.nextIs(t_bar))
            break;

        const tag = parseOneTag(it);

        tags.push(tag);
    }
        
    return tags;
}

export default function parseTuple(str: string): Tuple {
    if (typeof str !== 'string')
        throw new Error('expected string');

    const it = lexStringToIterator(str);

    try {
        const tags = parseTags(it);
        return tagsToTuple(tags);
    } catch(e) {
        console.error(e);
        throw new Error('Error trying to parse relation: ' + str);
    }
}