import Graph from './Graph';
import GenerateAPIAPI from './GenerateAPIAPI';
declare class JavascriptCodeWriter {
    out: (s: string) => void;
    needsNewline: boolean;
    inputsNeedComma: boolean;
    indentLevel: number;
    increaseIndent(): void;
    decreaseIndent(): void;
    startNewLine(): void;
    startFunction(funcName: string, outputType: string | null, writeInputs: (writer: JavascriptCodeWriter) => void): void;
    writeInput(name: string, typeName?: string): void;
    finishFunction(): void;
    writeLine(line?: string): void;
}
export declare class APIGenerator {
    graph: Graph;
    api: GenerateAPIAPI;
    constructor(graph: Graph);
    generateMethods(writer: JavascriptCodeWriter): void;
    asJavascript(): string;
}
export declare function generateAPI(graph: Graph): void;
export {};
