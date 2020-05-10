import Token from './Token';
import TokenIterator from './TokenIterator';
export default class LexedText {
    tokens: Token[];
    originalStr?: string;
    iterator: TokenIterator;
    constructor(originalStr: string);
    getTokenText(token: Token): string;
    getUnquotedText(token: Token): string;
    tokenCharIndex(tokenIndex: number): number;
}
