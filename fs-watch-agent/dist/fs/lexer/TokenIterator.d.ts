import { Token, TokenDef, LexedText } from '.';
import SourcePos from './SourcePos';
export default class TokenIterator {
    position: number;
    tokens: Token[];
    result?: LexedText;
    constructor(tokens: Token[]);
    discardSpaces(): void;
    getPosition(): number;
    next(lookahead?: number): Token;
    nextIs(match: TokenDef, lookahead?: number): boolean;
    nextText(lookahead?: number): string;
    nextIsIdentifier(str: string, lookahead?: number): boolean;
    nextUnquotedText(lookahead?: number): string;
    nextLength(lookahead?: number): number;
    finished(lookahead?: number): boolean;
    consume(match?: TokenDef): void;
    consumeIdentifier(s: string): void;
    consumeNextText(lookahead?: number): string;
    consumeNextUnquotedText(lookahead?: number): string;
    consumeTextWhile(condition: (next: Token) => boolean): string;
    tryConsume(match: TokenDef): boolean;
    skipWhile(condition: (next: Token) => boolean): void;
    skipUntilNewline(): void;
    skipSpaces(): void;
    consumeSpace(): void;
    consumeWhitespace(): void;
    toSourcePos(firstToken: Token, lastToken: Token): SourcePos;
}
