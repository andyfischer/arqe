"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cursor {
    constructor(file) {
        this.file = file;
        this.range = this.entireFile();
    }
    entireFile() {
        const lexed = this.file.getLexed();
        return {
            start: 0,
            end: lexed.tokens.length
        };
    }
    *eachTokenInRange() {
        const lexed = this.file.getLexed();
        for (let i = this.range.start; i < this.range.end; i++) {
            yield lexed.tokens[i];
        }
    }
    hasSelection() {
        return !!this.range;
    }
    getSelectedText() {
        return this.file.textContents.slice(this.range.start, this.range.end);
    }
    patch(text) {
        const lexed = this.file.getLexed();
        const charStart = lexed.tokenCharIndex(this.range.start);
        const charEnd = lexed.tokenCharIndex(this.range.end);
        this.file.patch(charStart, charEnd, text);
    }
}
exports.default = Cursor;
//# sourceMappingURL=Cursor.js.map