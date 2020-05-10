import CodeFile from './CodeFile';
import { Token } from '../lexer';
export interface TokenRange {
    start?: number;
    end?: number;
}
export default class Cursor {
    file: CodeFile;
    range?: TokenRange;
    constructor(file: CodeFile);
    entireFile(): TokenRange;
    eachTokenInRange(): IterableIterator<Token>;
    hasSelection(): boolean;
    getSelectedText(): string;
    patch(text: string): void;
}
