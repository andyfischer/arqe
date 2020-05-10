"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Writer {
    constructor() {
        this.indentLevel = 0;
        this.spacesPerIndent = 4;
        this.lines = [];
        this.startingNewLine = true;
    }
    indent() {
        this.indentLevel += 1;
    }
    unindent() {
        if (this.indentLevel == 0) {
            throw new Error('Writer: indent level went below 0');
        }
        this.indentLevel -= 1;
    }
    write(s) {
        if (this.startingNewLine) {
            const indent = ' '.repeat(this.indentLevel * this.spacesPerIndent);
            this.lines.push(indent + s);
            this.startingNewLine = false;
        }
        else {
            this.lines[this.lines.length - 1] += s;
        }
    }
    writeln(s) {
        if (s)
            this.write(s);
        if (this.startingNewLine)
            this.lines.push('');
        this.startingNewLine = true;
    }
    endLine() {
        this.startingNewLine = true;
    }
    getResult() {
        return this.lines.join('\n');
    }
}
exports.default = Writer;
//# sourceMappingURL=LineWriter.js.map