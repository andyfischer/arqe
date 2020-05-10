"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseExpr_1 = require("../parseExpr");
it('correctly parses', () => {
    expect(parseExpr_1.parseExprFromString("(list 1 2 str)")).toEqual(['list', '1', '2', 'str']);
});
it('correctly parses nested exprs', () => {
    expect(parseExpr_1.parseExprFromString("(list (add 1 2) str)")).toEqual(['list', ['add', '1', '2'], 'str']);
});
it('correctly evals', () => {
    const expr = parseExpr_1.parseExprFromString("(list 1 2)");
    expect(parseExpr_1.evalExpr({}, expr)).toEqual(['1', '2']);
});
it('correctly evals with custom handler', () => {
    const expr = parseExpr_1.parseExprFromString("(list 1 2)");
    function add(items) {
        return items.map(parseInt).reduce((total, i) => total + i).toString();
    }
    expect(parseExpr_1.evalExpr({ add }, expr)).toEqual(['1', '2']);
});
//# sourceMappingURL=expr.test.js.map