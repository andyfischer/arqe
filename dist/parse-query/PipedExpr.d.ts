import Expr from './Expr';
import ParsedQuery from './ParsedQuery';
import QueryExpr from './QueryExpr';
import SourcePos from '../types/SourcePos';
export default class PipedExpr implements Expr {
    id: number;
    type: 'piped';
    itemIds: number[];
    statementIndent?: number;
    sourcePos?: SourcePos;
    parent: ParsedQuery;
    constructor(values: any);
    getPipedQueries(): QueryExpr[];
}
