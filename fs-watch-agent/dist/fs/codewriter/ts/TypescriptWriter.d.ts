import { LineWriter } from '../shared';
interface Interface {
    name: string;
    isExport?: boolean;
    isDefaultExport?: boolean;
}
interface InterfaceField {
    name: string;
    optional?: boolean;
    typeDecl: string;
}
export default class TypescriptWriter {
    out: LineWriter;
    writeToFile(filename: string): Promise<void>;
    lineComment(s: string): void;
    interface_(i: Interface): void;
    interfaceField(f: InterfaceField): void;
    import_(symbols: string, fromPath: string): void;
    line(str: string): void;
    blankLine(): void;
    openBlock(str: string): void;
    closeBlock(str?: string): void;
}
export {};
