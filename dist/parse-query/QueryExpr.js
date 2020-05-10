"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryExpr {
    constructor(values) {
        Object.assign(this, values);
    }
    getNameValuePairs() {
        const out = {};
        for (const arg of this.args) {
            if (arg.lhsName) {
                out[arg.lhsName] = arg.rhsValue;
            }
        }
        return out;
    }
    getPositionalArgs() {
        const out = [];
        for (let i = 1; i < this.args.length; i += 1) {
            const arg = this.args[i];
            if (arg.keyword)
                out.push(arg.keyword);
        }
        return out;
    }
    getPipedQueries() {
        return [this];
    }
}
exports.default = QueryExpr;
//# sourceMappingURL=QueryExpr.js.map