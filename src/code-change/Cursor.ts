
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
}
