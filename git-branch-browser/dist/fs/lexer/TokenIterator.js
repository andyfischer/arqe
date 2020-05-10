"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class TokenIterator {
    constructor(tokens) {
        this.position = 0;
        this.tokens = tokens;
    }
    discardSpaces() {
        this.tokens = this.tokens.filter(token => token.match !== _1.t_space);
    }
    getPosition() {
        return this.position;
    }
    next(lookahead = 0) {
        const pos = this.position + lookahead;
        if (pos < 0) {
            return {
                startPos: 0,
                endPos: 0,
                tokenIndex: 0,
                length: 0,
                lineStart: 0,
                columnStart: 0,
                leadingIndent: 0,
                match: null
            };
        }
        if (pos >= this.tokens.length) {
            const lastToken = this.tokens[this.tokens.length - 1];
            return {
                startPos: lastToken.endPos,
                endPos: lastToken.endPos,
                tokenIndex: -1,
                length: 0,
                lineStart: lastToken.lineStart,
                columnStart: lastToken.columnStart + lastToken.length,
                leadingIndent: lastToken.leadingIndent,
                match: null
            };
        }
        return this.tokens[pos];
    }
    nextIs(match, lookahead = 0) {
        const token = this.next(lookahead);
        return token.match === match;
    }
    nextText(lookahead = 0) {
        const token = this.next(lookahead);
        return this.result.getTokenText(token);
    }
    nextIsIdentifier(str, lookahead = 0) {
        return this.nextIs(_1.t_ident, lookahead) && this.nextText(lookahead) === str;
    }
    nextUnquotedText(lookahead = 0) {
        const token = this.next(lookahead);
        return this.result.getUnquotedText(token);
    }
    nextLength(lookahead = 0) {
        const token = this.next(lookahead);
        return token.endPos - token.startPos;
    }
    finished(lookahead = 0) {
        return (this.position + lookahead) >= this.tokens.length;
    }
    consume(match = null) {
        if (match !== null && !this.nextIs(match))
            throw new Error(`consume expected match: ${match.name}, found match: ${this.next().match.name}`);
        this.position += 1;
    }
    consumeIdentifier(s) {
        if (!this.nextIsIdentifier(s)) {
            throw new Error(`consume expected identifier: "${s}, found: ${this.nextText()}`);
        }
        this.position += 1;
    }
    consumeNextText(lookahead = 0) {
        const str = this.nextText(lookahead);
        this.consume();
        return str;
    }
    consumeNextUnquotedText(lookahead = 0) {
        const str = this.nextUnquotedText(lookahead);
        this.consume();
        return str;
    }
    consumeTextWhile(condition) {
        let str = '';
        while (!this.finished() && condition(this.next())) {
            str += this.consumeNextText();
        }
        return str;
    }
    tryConsume(match) {
        if (this.nextIs(match)) {
            this.consume();
            return true;
        }
        return false;
    }
    skipWhile(condition) {
        while (condition(this.next()) && !this.finished())
            this.consume();
    }
    skipUntilNewline() {
        this.skipWhile(token => token.match !== _1.t_newline);
        if (this.nextIs(_1.t_newline))
            this.consume();
    }
    skipSpaces() {
        while (this.nextIs(_1.t_space))
            this.consume(_1.t_space);
    }
    consumeSpace() {
        while (this.nextIs(_1.t_space))
            this.consume(_1.t_space);
    }
    consumeWhitespace() {
        while (this.nextIs(_1.t_space) || this.nextIs(_1.t_newline))
            this.consume();
    }
    toSourcePos(firstToken, lastToken) {
        return {
            posStart: firstToken.startPos,
            posEnd: lastToken.endPos,
            lineStart: firstToken.lineStart,
            columnStart: firstToken.columnStart,
            lineEnd: firstToken.lineStart,
            columnEnd: lastToken.columnStart + lastToken.length
        };
    }
}
exports.default = TokenIterator;
//# sourceMappingURL=TokenIterator.js.map