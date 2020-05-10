"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('-x flag returns "set" command', async ({ run }) => {
    await run('set getflags/1');
    expect((await run('get -x getflags/1')).replace(' extra', '')).toEqual('set getflags/1');
});
//# sourceMappingURL=GetFlags.test.js.map