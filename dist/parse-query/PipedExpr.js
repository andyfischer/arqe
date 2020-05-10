"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PipedExpr {
    constructor(values) {
        Object.assign(this, values);
    }
    getPipedQueries() {
        return this.itemIds.map(id => this.parent.exprs[id]);
    }
}
exports.default = PipedExpr;
//# sourceMappingURL=PipedExpr.js.map