
import CodeFile from './CodeFile'
import { Token } from '../lexer'

export interface TokenRange {
    start?: number
    end?: number
}

export default class Cursor {

    file: CodeFile
    ranges: TokenRange[]

    constructor(file: CodeFile) {
        this.file = file;
        this.ranges = [ this.entireFile() ]
    }

    entireFile(): TokenRange {
        return {
            start: 0,
            end: this.file.lexed.tokens.length
        }
    }

    *eachTokenInRange() {
        for (const range of this.ranges) {
            for (let i = range.start; i < range.end; i++) {
                yield this.file.lexed.tokens[i];
            }
        }
    }

    getSelectedText(): string {
        if (this.ranges.length === 0)
            throw new Error("no selected text");

        if (this.ranges.length > 1)
            throw new Error("multiple selected ranges, can't call .getSelectedText");

        const range = this.ranges[0];
        return this.file.textContents.slice(range.start, range.end);
    }
}
