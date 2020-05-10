"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unescape_1 = __importDefault(require("./unescape"));
const tokens_1 = require("./tokens");
class LexedText {
    constructor(originalStr) {
        this.originalStr = originalStr;
    }
    getTokenText(token) {
        return this.originalStr.slice(token.startPos, token.endPos);
    }
    getUnquotedText(token) {
        if (token.match === tokens_1.t_quoted_string) {
            const str = this.originalStr.slice(token.startPos + 1, token.endPos - 1);
            return unescape_1.default(str);
        }
        return this.getTokenText(token);
    }
    tokenCharIndex(tokenIndex) {
        if (tokenIndex >= this.tokens.length)
            return this.originalStr.length;
        return this.tokens[tokenIndex].startPos;
    }
}
exports.default = LexedText;
