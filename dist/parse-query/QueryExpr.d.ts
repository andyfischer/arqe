import Expr from './Expr';
import SourcePos from '../types/SourcePos';
import ParsedQuery from './ParsedQuery';
interface ArgExpr {
    keyword?: string;
    lhsName?: string;
    rhsValue?: string;
}
export default class QueryExpr implements Expr {
    id: number;
    type: 'query';
    args: ArgExpr[];
    sourcePos?: SourcePos;
    statementIndent?: number;
    parent: ParsedQuery;
    constructor(values: any);
    getNameValuePairs(): {
        [key: string]: any;
    };
    getPositionalArgs(): string[];
    getPipedQueries(): QueryExpr[];
}
export {};
