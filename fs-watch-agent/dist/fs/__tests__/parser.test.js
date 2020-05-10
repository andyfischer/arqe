"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = require("../parseCommand");
it('parses correctly', () => {
    const chain = parseCommand_1.parseCommandChain("get x y | join y z");
    expect(chain.commands[0].stringify()).toEqual('get x y');
    expect(chain.commands[1].stringify()).toEqual('join y z');
});
it('parses tag identifiers', () => {
    const pattern = parseCommand_1.parsePattern("x [from $a] y [from $b] z/1");
    expect(pattern.tags[0].identifier).toBeFalsy();
    expect(pattern.tags[0].tagType).toEqual('x');
    expect(pattern.tags[1].identifier).toEqual('a');
    expect(pattern.tags[1].tagType).toEqual('y');
    expect(pattern.tags[2].identifier).toEqual('b');
    expect(pattern.tags[2].tagType).toEqual('z');
    expect(pattern.tags[2].tagValue).toEqual('1');
});
it('parses exprs', () => {
    const pattern = parseCommand_1.parseCommandChain("modify a/(increment)").commands[0].toPattern();
    expect(pattern.tags[0].tagType).toEqual('a');
    expect(pattern.tags[0].valueExpr).toEqual(['increment']);
});
it('parses new style tags', () => {
    const pattern = parseCommand_1.parseCommandChain("modify a(b)").commands[0].toPattern();
    expect(pattern.tags[0].tagType).toEqual('a');
    expect(pattern.tags[0].tagValue).toEqual('b');
});
it('parses complex expressions inside new style tags', () => {
    const pattern = parseCommand_1.parseCommandChain("set touchpoint/0.6 query(${target} touchpoint/*)").commands[0].toPattern();
    expect(pattern.tags[0].tagType).toEqual('touchpoint');
    expect(pattern.tags[0].tagValue).toEqual('0.6');
    expect(pattern.tags[1].tagType).toEqual('query');
    expect(pattern.tags[1].tagValue).toEqual('${target} touchpoint/*');
});
it('parses nested parens inside new style tags', () => {
    const pattern = parseCommand_1.parseCommandChain("set tag(nested (expr) here)").commands[0].toPattern();
    expect(pattern.tags[0].tagType).toEqual('tag');
    expect(pattern.tags[0].tagValue).toEqual('nested (expr) here');
});
//# sourceMappingURL=parser.test.js.map