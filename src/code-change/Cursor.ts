
import CodeFile from './CodeFile'
import { Token } from '../lexer'

export interface TokenRange {
    start?: number
    end?: number
}

export default class Cursor {

    file: CodeFile
    range?: TokenRange

    constructor(file: CodeFile) {
        this.file = file;
        this.range = this.entireFile()
    }

    entireFile(): TokenRange {
        const lexed = this.file.getLexed();

        return {
            start: 0,
            end: lexed.tokens.length
        }
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

    getSelectedText(): string {
        return this.file.textContents.slice(this.range.start, this.range.end);
    }

    patch(text: string) {
        const lexed = this.file.getLexed();
        const charStart = lexed.tokenCharIndex(this.range.start);
        const charEnd = lexed.tokenCharIndex(this.range.end);
        this.file.patch(charStart, charEnd, text);
    }
}
