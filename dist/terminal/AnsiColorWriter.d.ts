export declare const ansi_red = 31;
export declare const ansi_green = 32;
export declare const ansi_yellow = 33;
export declare const ansi_bright_black = 90;
export default class AnsiColorWriter {
    out: string[];
    setFG(n: number): void;
    write(str: string): void;
    reset(): void;
    finish(): string;
}
