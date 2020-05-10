import { LexedText } from '../lexer';
export default class CodeFile {
    textContents: string;
    _lexed?: LexedText;
    readFile(filename: string): Promise<void>;
    saveFile(filename: string): Promise<void>;
    readString(text: string): void;
    getText(): string;
    getLexed(): LexedText;
    patch(charStart: number, charEnd: number, text: string): void;
}
