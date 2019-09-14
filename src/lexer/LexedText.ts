
import Token from './Token'
import TokenIterator from './TokenIterator'

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

    tokenCharIndex(tokenIndex: number) {
        if (tokenIndex >= this.tokens.length)
            return this.originalStr.length;

        return this.tokens[tokenIndex].startPos;
    }
}
