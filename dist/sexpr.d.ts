export declare function parseSexprFromString(s: string): string | any[];
declare type EvalFunc = (inputs: string[]) => string;
export declare function evalSexpr(environment: {
    [name: string]: EvalFunc;
}, parsed: any[]): any;
export {};
