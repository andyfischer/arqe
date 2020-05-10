export declare class Block {
    blockType: string;
    statements: Statement[];
    parent: Statement;
    formatOneLine: boolean;
    constructor(blockType: string, parent: Statement);
    stringify(): string;
    addImport(lhs: string, rhs: string): void;
    addClass(className: string): ClassDef;
    addRaw(text: string): void;
    addBlank(): void;
    addMethod(name: string): FunctionDecl;
    addIf(): IfBlock;
    addObjectField(name: string, value: string): ObjectField;
}
interface Statement {
    statementType: string;
    line: () => string;
    contents?: Block;
}
declare class ClassDef implements Statement {
    statementType: string;
    name: string;
    contents: Block;
    isExport: boolean;
    isExportDefault: boolean;
    constructor(name: string);
    addField(name: string, tsType: string): void;
    line(): string;
}
declare class ObjectField implements Statement {
    statementType: string;
    name: string;
    valueExpr: string;
    constructor(name: string, valueExpr: string);
    line(): string;
}
declare class FunctionDecl implements Statement {
    statementType: string;
    format: string;
    name: string;
    inputs: {
        name: string;
        tsType: string;
    }[];
    outputType: string;
    contents: Block;
    isAsync: boolean;
    constructor(format: string, name: string);
    addInput(name: string, tsType: string): void;
    setOutputType(tsType: string): void;
    line(): string;
}
declare class IfBlock implements Statement {
    statementType: string;
    conditionExpr: string;
    contents: Block;
    constructor();
    setCondition(s: string): void;
    line(): string;
}
export declare function startFile(): Block;
export declare function startObjectLiteral(): Block;
export declare function formatBlock(block: Block): void;
export declare function stringifyBlock(block: Block): string;
export {};
