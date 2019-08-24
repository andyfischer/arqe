
import { Token, TokenDef, TokenizeResult, t_space, t_newline } from '.'

export default class TokenReader {

    position: number = 0
    tokens: Token[]
    result?: TokenizeResult

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
        if (pos >= this.tokens.length) {
            return {
                startPos: this.tokens.length,
                endPos: this.tokens.length,
                length: 0,
                lineStart: 0,
                columnStart: 0,
                match: null
            }
        }

        return this.tokens[pos];
    }

    last(): Token {
        const pos = this.position;
        if (pos == 0) {
            return {
                startPos: 0,
                endPos: 0,
                length: 0,
                lineStart: 0,
                columnStart: 0,
                match: null
            }
        }
        return this.tokens[pos - 1];
    }

    nextIs(match: TokenDef, lookahead: number = 0): boolean {
        const pos = this.position + lookahead;
        if (pos >= this.tokens.length)
            return false;

        return this.tokens[pos].match === match;
    }

    nextText(lookahead: number = 0): string {
        const token = this.next(lookahead);
        return this.result.getTokenText(token);
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
}
