"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../../scope");
const exposeSimpleExpr_1 = __importDefault(require("../exposeSimpleExpr"));
const parse_query_1 = require("../../parse-query");
it('sets positional list', () => {
    const graph = new scope_1.Graph();
    const scope = new scope_1.Scope(graph);
    exposeSimpleExpr_1.default(scope, parse_query_1.parseAsOneSimple("command b c"));
    expect(scope.get('#positionals')).toEqual(["command", "b", "c"]);
});
it('sets key-value options', () => {
    const graph = new scope_1.Graph();
    const scope = new scope_1.Scope(graph);
    exposeSimpleExpr_1.default(scope, parse_query_1.parseAsOneSimple("command b=1 c=xyz"));
    expect(scope.get('b')).toEqual('1');
    expect(scope.get('c')).toEqual('xyz');
});
//# sourceMappingURL=exposeSimpleExpr.test.js.map