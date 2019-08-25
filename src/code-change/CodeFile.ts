
import fs from 'fs-extra'
import { tokenizeString, TokenizeResult } from '../lexer'

export default class CodeFile {
    textContents: string
    tokens?: TokenizeResult

    async open(filename: string) {
        this.textContents = await fs.readFile(filename, 'utf8')
        this.tokens = tokenizeString(this.textContents)
    }
}
