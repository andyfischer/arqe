import { TokenDef } from './tokens';
import { Token } from '.';
interface BracketFrame {
    startedAtIndex: number;
    lookingFor: string;
}
export default class Context {
    str: string;
    index: number;
    tokenIndex: number;
    isIterator: boolean;
    lineNumber: number;
    charNumber: number;
    leadingIndent: number;
    resultTokens: Token[];
    bracketStack: BracketFrame[];
    constructor(str: string);
    finished(lookahead?: number): boolean;
    next(lookahead?: number): number;
    nextChar(lookahead?: number): string;
    position(): number;
    getTokenText(token: Token): string;
    consume(match: TokenDef, len: number): Token;
    consumeWhile(match: TokenDef, matcher: (c: number) => boolean): Token;
}
export {};
