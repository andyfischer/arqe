
import Expr from './Expr'

export default class ParsedQuery {
    exprs: { [id:string]: Expr } = {}
    statementId?: number

    pushExpr(expr: Expr) {
        if (!expr.id)
            throw new Error('expr must have id');

        this.exprs[expr.id] = expr;
    }

    getStatement() {
        const expr = this.exprs[this.statementId];
        return expr;
    }
}

