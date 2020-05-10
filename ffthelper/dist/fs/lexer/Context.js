"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokens_1 = require("./tokens");
const c_newline = '\n'.charCodeAt(0);
class Context {
    constructor(str) {
        this.index = 0;
        this.tokenIndex = 0;
        this.isIterator = true;
        this.lineNumber = 1;
        this.charNumber = 1;
        this.leadingIndent = 0;
        this.resultTokens = [];
        this.bracketStack = [];
        this.str = str;
    }
    finished(lookahead = 0) {
        return (this.index + lookahead) >= this.str.length;
    }
    next(lookahead = 0) {
        if (this.index + lookahead >= this.str.length)
            return 0;
        return this.str.charCodeAt(this.index + lookahead);
    }
    nextChar(lookahead = 0) {
        if (this.index + lookahead >= this.str.length)
            return null;
        return this.str[this.index + lookahead];
    }
    position() {
        return this.index;
    }
    getTokenText(token) {
        return this.str.substr(token.startPos, token.endPos - token.startPos);
    }
    consume(match, len) {
        // update leadingIndent
        if (match === tokens_1.t_space && this.charNumber === 1)
            this.leadingIndent = len;
        const result = {
            match: match,
            length: len,
            tokenIndex: this.tokenIndex,
            startPos: this.index,
            endPos: this.index + len,
            lineStart: this.lineNumber,
            columnStart: this.charNumber,
            leadingIndent: this.leadingIndent
        };
        // update bracket stack
        if (match.bracketSide === 'left') {
            this.bracketStack.push({
                startedAtIndex: this.tokenIndex,
                lookingFor: match.bracketPairsWith
            });
        }
        if (match.bracketSide === 'right') {
            const lookingFor = (this.bracketStack.length > 0)
                && this.bracketStack[this.bracketStack.length - 1].lookingFor;
            if (match.name !== lookingFor) {
                // Closing bracket doesn't match opening bracket. TODO, save as an error.
            }
            else {
                const leftSideIndex = this.bracketStack[this.bracketStack.length - 1].startedAtIndex;
                const rightSideIndex = this.tokenIndex;
                result.pairsWithIndex = leftSideIndex;
                this.resultTokens[leftSideIndex].pairsWithIndex = rightSideIndex;
                this.bracketStack.pop();
            }
        }
        // update lineNumber & charNumber
        if (this.next(0) === c_newline) {
            this.lineNumber += 1;
            this.charNumber = 1;
        }
        else {
            this.charNumber += len;
        }
        this.tokenIndex += 1;
        this.index = result.endPos;
        return result;
    }
    consumeWhile(match, matcher) {
        let len = 0;
        while (matcher(this.next(len)) && this.next(len) !== 0)
            len += 1;
        return this.consume(match, len);
    }
}
exports.default = Context;
