
import { t_space, TokenDef } from './tokens'
import { Token } from '.'

const c_newline = '\n'.charCodeAt(0);

export default class StringReader {
    str: string
    index = 0
    isIterator = true
    lineNumber = 0
    charNumber = 1

    constructor(str: string) {
        this.str = str;
    }

    finished() : boolean {
        return this.index >= this.str.length;
    }

    next(lookahead:number = 0) {
        if (this.index+lookahead >= this.str.length)
            return 0;

        return this.str.charCodeAt(this.index+lookahead);
    }

    nextChar(lookahead: number = 0) {
        if (this.index+lookahead >= this.str.length)
            return null;

        return this.str[this.index+lookahead];
    }

    position() {
        return this.index;
    }

    getTokenText(token: Token) {
        return this.str.substr(token.startPos, token.endPos - token.startPos);
    }

    consume(match: TokenDef, len: number) {

        const result:Token = {
            match: match,
            startPos: this.index,
            endPos: this.index + len,
            lineNumber: this.lineNumber,
            charNumber: this.charNumber
        };

        if (this.next(0) === c_newline) {
            this.lineNumber += 1;
            this.charNumber = 1;
        } else {
            this.charNumber += len;
        }

        this.index = result.endPos;

        return result;
    }

    consumeWhile(match: TokenDef, matcher: (c: number) => boolean) {
        let len = 0;
        while (matcher(this.next(len)) && this.next(len) !== 0)
            len += 1;
        return this.consume(match, len);
    }
}
