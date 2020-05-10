import Expr from './Expr';
export default class ParsedQuery {
    exprs: {
        [id: string]: Expr;
    };
    statementId?: number;
    pushExpr(expr: Expr): void;
    getStatement(): Expr;
}
