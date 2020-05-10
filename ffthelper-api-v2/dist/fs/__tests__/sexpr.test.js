"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sexpr_1 = require("../sexpr");
it('correctly parses', () => {
    expect(sexpr_1.parseSexprFromString("(list 1 2 str)")).toEqual(['list', '1', '2', 'str']);
});
it('correctly parses nested exprs', () => {
    expect(sexpr_1.parseSexprFromString("(list (add 1 2) str)")).toEqual(['list', ['add', '1', '2'], 'str']);
});
it('correctly evals', () => {
    const expr = sexpr_1.parseSexprFromString("(list 1 2)");
    expect(sexpr_1.evalSexpr({}, expr)).toEqual(['1', '2']);
});
it('correctly evals with custom handler', () => {
    const expr = sexpr_1.parseSexprFromString("(list 1 2)");
    function add(items) {
        return items.map(parseInt).reduce((total, i) => total + i).toString();
    }
    expect(sexpr_1.evalSexpr({ add }, expr)).toEqual(['1', '2']);
});
