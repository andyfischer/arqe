
import { Token, TokenDef, LexedText, t_space, t_newline } from '.'
import SourcePos from '../types/SourcePos'

export default class TokenIterator {

    position: number = 0
    tokens: Token[]
    result?: LexedText

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    discardSpaces() {
        this.tokens = this.tokens.filter(token => token.match !== t_space);
    }

    getPosition() {
        return this.position;
    }

    next(lookahead: number = 0): Token {
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
            }
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
            }
        }

        return this.tokens[pos];
    }

    nextIs(match: TokenDef, lookahead: number = 0): boolean {
        const token = this.next(lookahead);
        return token.match === match;
    }

    nextText(lookahead: number = 0): string {
        const token = this.next(lookahead);
        return this.result.getTokenText(token);
    }

    nextUnquotedText(lookahead: number = 0): string {
        const token = this.next(lookahead);
        return this.result.getUnquotedText(token);
    }

    nextLength(lookahead: number = 0): number {
        const token = this.next(lookahead);
        return token.endPos - token.startPos;
    }

    finished(lookahead: number = 0): boolean {
        return (this.position + lookahead) >= this.tokens.length;
    }

    consume(match: TokenDef = null) {
        if (match !== null && !this.nextIs(match))
            throw new Error(`consume expected match: ${match}, found match: ${this.next().match}`);

        this.position += 1;
    }

    skipWhile(condition: (next: Token) => boolean) {
        while (condition(this.next()) && !this.finished())
            this.consume();
    }

    skipUntilNewline() {
        this.skipWhile(token => token.match !== t_newline);
        if (this.nextIs(t_newline))
            this.consume();
    }

    skipSpaces() {
        while (this.nextIs(t_space))
            this.consume(t_space);
    }

    toSourcePos(firstToken: Token, lastToken: Token): SourcePos {
        return {
            posStart: firstToken.startPos,
            posEnd: lastToken.endPos,
            lineStart: firstToken.lineStart,
            columnStart: firstToken.columnStart,
            lineEnd: firstToken.lineStart,
            columnEnd: lastToken.columnStart + lastToken.length
        }
    }
}
