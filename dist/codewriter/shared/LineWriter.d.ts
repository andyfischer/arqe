export default class Writer {
    indentLevel: number;
    spacesPerIndent: number;
    lines: string[];
    startingNewLine: boolean;
    indent(): void;
    unindent(): void;
    write(s: string): void;
    writeln(s?: string): void;
    endLine(): void;
    getResult(): string;
}
