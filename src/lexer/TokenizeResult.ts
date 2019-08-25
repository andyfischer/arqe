
import Token from './Token'
import TokenIterator from './TokenIterator'

export default class TokenizeResult {
    tokens: Token[]
    originalStr?: string
    iterator: TokenIterator

    constructor(originalStr: string) {
        this.originalStr = originalStr;
    }

    getTokenText(token: Token) {
        return this.originalStr.slice(token.startPos, token.endPos);
    }
}
