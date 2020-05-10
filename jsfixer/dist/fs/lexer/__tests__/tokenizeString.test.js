"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
it('pairs braces', () => {
    const lexed = __1.tokenizeString('{ }');
    expect(lexed.tokens.length).toEqual(3);
    expect(lexed.tokens[0].pairsWithIndex).toEqual(2);
    expect(lexed.tokens[2].pairsWithIndex).toEqual(0);
});
//# sourceMappingURL=tokenizeString.test.js.map