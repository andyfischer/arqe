
import fs from 'fs-extra'
import { tokenizeString, LexedText } from '../lexer'

export default class CodeFile {
    textContents: string
    lexed?: LexedText

    async readFile(filename: string) {
        this.textContents = await fs.readFile(filename, 'utf8')
        this.lexed = tokenizeString(this.textContents)
    }

    readString(text: string) {
        this.textContents = text;
        this.lexed = tokenizeString(this.textContents);
    }
}
