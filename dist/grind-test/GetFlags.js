"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestSuite_1 = require("./TestSuite");
const suite = TestSuite_1.startSuite();
const { run } = suite;
suite.describe('GetFlags', () => {
    suite.test('-x flag returns "set" command', () => {
        run('set getflags/1');
        expect(run('get -x getflags/1')).toEqual('set -x getflags/1');
    });
});
//# sourceMappingURL=GetFlags.js.map