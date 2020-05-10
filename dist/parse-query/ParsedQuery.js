"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParsedQuery {
    constructor() {
        this.exprs = {};
    }
    pushExpr(expr) {
        if (!expr.id)
            throw new Error('expr must have id');
        this.exprs[expr.id] = expr;
    }
    getStatement() {
        const expr = this.exprs[this.statementId];
        return expr;
    }
}
exports.default = ParsedQuery;
//# sourceMappingURL=ParsedQuery.js.map