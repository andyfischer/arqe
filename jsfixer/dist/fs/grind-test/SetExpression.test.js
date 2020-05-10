"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('set expression works', async ({ run }) => {
    expect(await run('set a b c/1')).toEqual(['a b c/1']);
    expect(await run('set a b c/(set 2)')).toEqual(['a b c/2']);
});
//# sourceMappingURL=SetExpression.test.js.map