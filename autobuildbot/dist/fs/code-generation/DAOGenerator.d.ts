import Graph from '../Graph';
import DAOGeneratorGeneratedDAO from './DAOGeneratorGeneratedDAO';
interface InputDef {
    name: string;
    inputType?: string;
}
declare class JavascriptCodeWriter {
    writeOut: (s: string) => void;
    needsNewline: boolean;
    inputsNeedComma: boolean;
    indentLevel: number;
    indent(): this;
    unindent(): this;
    startNewLine(): void;
    defineMethod(opts: {
        name: string;
        outputType?: string;
        isAsync?: boolean;
        inputs: InputDef[];
    }): this;
    input(name: string, typeName?: string): void;
    endBlock(): this;
    line(line?: string): this;
    If(condition: string): this;
    comment(s: string): void;
}
export declare class DAOGenerator {
    target: string;
    api: DAOGeneratorGeneratedDAO;
    destinationFilename: string;
    verboseLogging: boolean;
    constructor(api: DAOGeneratorGeneratedDAO, target: string);
    generateFullQuery(writer: JavascriptCodeWriter, touchpoint: string): void;
    relationCountGuards(writer: JavascriptCodeWriter, touchpoint: string): void;
    returnOneResult(writer: JavascriptCodeWriter, touchpoint: string): void;
    returnResult(writer: JavascriptCodeWriter, touchpoint: string): void;
    sortInputs(inputs: string[]): string[];
    getTouchpointOutputType(touchpoint: string): any;
    getTypeForListenerCallback(touchpoint: string): string;
    startTouchpointMethod(writer: JavascriptCodeWriter, touchpoint: string): void;
    fetchRels(writer: JavascriptCodeWriter, touchpoint: string): void;
    generateMethod(writer: JavascriptCodeWriter, touchpoint: string): void;
    relationOutputExpression(touchpoint: string): string;
    listenerBody(writer: JavascriptCodeWriter, touchpoint: string): void;
    generateMethods(writer: JavascriptCodeWriter): void;
    asJavascript(): string;
}
export declare function runDAOGenerator(graph: Graph, target: string): void;
export {};
