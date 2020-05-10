"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseSyntaxLine_1 = __importDefault(require("../parseSyntaxLine"));
it('parses a list of identifiers', () => {
    const syntax = parseSyntaxLine_1.default('def-command mycommand');
    expect(syntax.clauses).toEqual([{
            key: 'def-command'
        }, {
            key: 'mycommand'
        }]);
});
it('parses key=value pairs', () => {
    const syntax = parseSyntaxLine_1.default('do-something tag key1=value1');
    expect(syntax.clauses).toEqual([{
            key: 'do-something'
        }, {
            key: 'tag'
        }, {
            key: 'key1',
            assignVal: 'value1'
        }]);
});
it('parses base64 as a value (even when it has a =)', () => {
    const syntax = parseSyntaxLine_1.default('do-something tag key1=abc=');
    expect(syntax.clauses).toEqual([{
            key: 'do-something'
        }, {
            key: 'tag'
        }, {
            key: 'key1',
            assignVal: 'abc='
        }]);
});
xit('handles quotes', () => {
    const syntax = parseSyntaxLine_1.default('do-something "quoted string"');
    expect(syntax.clauses).toEqual([{
            key: 'do-something'
        }, {
            key: 'quoted string'
        }]);
});
//# sourceMappingURL=parseSyntaxLine.test.js.map