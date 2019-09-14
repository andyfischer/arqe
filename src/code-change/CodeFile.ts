
import fs from 'fs-extra'
import { tokenizeString, LexedText } from '../lexer'

export default class CodeFile {
    textContents: string
    _lexed?: LexedText

    async readFile(filename: string) {
        this.textContents = await fs.readFile(filename, 'utf8')
    }

    readString(text: string) {
        this.textContents = text;
    }

    getText() {
        return this.textContents;
    }

    getLexed() {
        if (!this._lexed) {
            this._lexed = tokenizeString(this.textContents)
        }
        return this._lexed;
    }

    patch(charStart: number, charEnd: number, text: string) {
        this.textContents =
            this.textContents.slice(0, charStart)
            + text
            + this.textContents.slice(charEnd);

        // throw out 'lexed' because it now needs to be regenerated.
        this._lexed = null;
    }
}
