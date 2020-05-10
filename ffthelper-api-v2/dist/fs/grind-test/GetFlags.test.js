"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const suite = _1.startSuite();
suite.test('-x flag returns "set" command', async ({ run }) => {
    await run('set getflags/1');
    expect((await run('get -x getflags/1')).replace(' extra', '')).toEqual('set getflags/1');
});
