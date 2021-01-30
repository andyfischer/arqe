
import Tag, { newTagFromObject, TagOptions } from '../Tag'
import { TokenIterator, Token, TokenDef, t_plain_value, t_quoted_string, t_star,
    t_space, t_hash, t_newline, t_bar, t_slash,
    t_dot, t_question, t_integer, t_dash, t_dollar, t_lbracket, t_rbracket,
    t_lparen, t_rparen, t_equals } from '../lexer'
import { parseTupleTokens } from './parseTuple'

export default function parseOneTag(it: TokenIterator): Tag {

    let identifier;

    // Identifier prefix
    if (it.tryConsume(t_lbracket)) {
        if (!it.nextIs(t_plain_value) || it.nextText() !== 'from')
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
    while (it.nextIs(t_plain_value) || it.nextIs(t_dot) || it.nextIs(t_dash) || it.nextIs(t_integer))
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

    if (it.tryConsume(t_lparen)) {

        const value = parseTupleTokens(it);

        if (!it.tryConsume(t_rparen))
            throw new Error('Expected )');

        return {
            value
        }
    }

    if (it.tryConsume(t_lbracket)) {
        let isDoubleBracket = it.tryConsume(t_lbracket);
        let text = '';

        while (!it.finished()) {

            if (isDoubleBracket) {
                if (it.nextIs(t_rbracket) && it.nextIs(t_rbracket, 1))
                    break;
            } else {
                if (it.nextIs(t_rbracket))
                    break;
            }

            text += it.consumeNextUnquotedText();
        }

        if (isDoubleBracket) {
            if (!it.tryConsume(t_rbracket) || !it.tryConsume(t_rbracket)) {
                throw new Error('expected ]]');
            }
        } else {
            if (!it.tryConsume(t_rbracket)) {
                throw new Error('expected ]');
            }
        }

        return { 
            value: text
        }
    }

    if (it.tryConsume(t_slash)) {
        if (it.nextIs(t_dollar) && it.nextIs(t_plain_value, 1)) {
            it.consume();
            const identifier = it.consumeNextUnquotedText();

            return {
                identifier
            }
        }

        if (it.tryConsume(t_star)) {
            return {
                starValue: true
            }
        }

        let iterationCount = 0;
        let parenDepth = 0;
        tagValue = '';

        while (!it.finished()) {

            if (it.nextIs(t_space) || it.nextIs(t_newline) || it.nextIs(t_rparen))
                break;

            iterationCount += 1;
            if (iterationCount > 1000)
                throw new Error('too many iterations when parsing tag value');

            const text = it.consumeNextUnquotedText();

            tagValue += text;
        }

        return {
            value: tagValue,
        }
    }

    if (it.tryConsume(t_equals)) {
        it.skipSpaces();

        if (it.nextIs(t_lparen)) {
            const value = parseTupleTokens(it);

            if (!it.tryConsume(t_rparen))
                throw new Error('Expected )');
            return {
                value
            }
        }

        let value = it.consumeNextUnquotedText();
        while (it.nextIs(t_plain_value) || it.nextIs(t_dot) || it.nextIs(t_slash))
            value += it.consumeNextUnquotedText();

        return {
            value
        }
    }

    return {};
}
