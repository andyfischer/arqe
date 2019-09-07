
export default class Writer {
    indentLevel: number = 0
    spacesPerIndent: number = 4
    lines: string[] = []
    startingNewLine = true

    indent() {
        this.indentLevel += 1;
    }

    unindent() {
        if (this.indentLevel == 0) {
            throw new Error('Writer: indent level went below 0')
        }
        this.indentLevel -= 1;
    }

    write(s: string) {
        if (this.startingNewLine) {
            const indent = ' '.repeat(this.indentLevel * this.spacesPerIndent);
            this.lines.push(indent + s);
            this.startingNewLine = false;
        } else {
            this.lines[this.lines.length - 1] += s;
        }
    }

    writeln(s?: string) {
        if (s)
            this.write(s);
        this.startingNewLine = true;
    }

    endLine() {
        this.startingNewLine = true;
    }

    getResult() {
        return this.lines.join('\n');
    }
}
