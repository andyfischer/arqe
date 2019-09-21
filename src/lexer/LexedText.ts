
import Token from './Token'
import TokenIterator from './TokenIterator'
import unescape from './unescape'

export default class LexedText {
    tokens: Token[]
    originalStr?: string
    iterator: TokenIterator

    constructor(originalStr: string) {
        this.originalStr = originalStr;
    }

    getTokenText(token: Token) {
        return this.originalStr.slice(token.startPos, token.endPos);
    }

    getUnquotedString(token: Token) {
        const str = this.originalStr.slice(token.startPos + 1, token.endPos - 1);
        return unescape(str);
    }

    tokenCharIndex(tokenIndex: number) {
        if (tokenIndex >= this.tokens.length)
            return this.originalStr.length;

        return this.tokens[tokenIndex].startPos;
    }
}
