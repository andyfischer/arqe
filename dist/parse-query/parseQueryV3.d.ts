import SourcePos from '../types/SourcePos';
interface QueryArg {
    keyword?: string;
    lhsName?: string;
    rhsValue?: string;
}
export interface SimpleExpr extends Expr {
    id: number;
    type: 'simple';
    args: QueryArg[];
    sourcePos?: SourcePos;
    originalStr?: string;
}
export interface PipeExpr extends Expr {
    id: number;
    type: 'pipe';
    pipedExprs: number[];
    sourcePos?: SourcePos;
    originalStr?: string;
}
export interface Expr {
    id: number;
    type: 'pipe' | 'simple';
    sourcePos?: SourcePos;
    originalStr?: string;
}
interface ProgressEvent {
}
interface ParseRequest {
    text: string;
    onExpr?: (expr: Expr) => any;
    onProgress?: (event: ProgressEvent) => Promise<any>;
}
interface ParseResult {
    exprs?: Expr[];
}
export declare function parseQueries(req: ParseRequest): ParseResult;
export declare function parseAsOneSimple(text: string): SimpleExpr;
export {};
