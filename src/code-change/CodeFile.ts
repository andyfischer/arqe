
import fs from 'fs-extra'
import { tokenizeString, TokenizeResult } from '../lexer'

export default class CodeFile {
    textContents: string
    tokens?: TokenizeResult

    async readFile(filename: string) {
        this.textContents = await fs.readFile(filename, 'utf8')
        this.tokens = tokenizeString(this.textContents)
    }

    readString(text: string) {
        this.textContents = text;
        this.tokens = tokenizeString(this.textContents);
    }
}
