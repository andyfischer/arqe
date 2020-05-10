import { TokenIterator } from './lexer';
export declare function parseExpr(it: TokenIterator): string | string[];
export declare function parseExprFromString(s: string): string | string[];
declare type EvalFunc = (inputs: string[]) => string;
export declare function evalExpr(environment: {
    [name: string]: EvalFunc;
}, parsed: any[]): any;
export declare function stringifyExpr(expr: string[] | string): string;
export {};
