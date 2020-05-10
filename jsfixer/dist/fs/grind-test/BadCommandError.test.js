"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
_1.test('unrecognized command error', async ({ run }) => {
    expect(await run('blah', { allowError: true })).toEqual('#error unrecognized command: blah');
});
_1.test('unrecognized command error with pipe', async ({ run }) => {
    expect(await run('blah | get', { allowError: true })).toEqual('#error unrecognized command: blah');
});
//# sourceMappingURL=BadCommandError.test.js.map