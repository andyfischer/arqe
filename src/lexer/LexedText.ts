
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

    /*
    getCorrespondingBracket(token: Token) {
        const def = token.match;

        if (!def.bracketPairsWith)
            throw new Error('token type has no corresponding bracket: ' + token.match.name);

        const direction = def.bracketSide === 'left' ? 1 : -1;
        const search = token.tokenIndex;
        const depth = 0;

        while (true) {
            if (search < 0 || search >= this.tokens.length)
                return null;

            const found = this.tokens[search];

            


            search += direction;
        }
    }
    */
}
