"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Setup_1 = require("./Setup");
it("initially doesn't have a value", () => {
    const existing = Setup_1.run('get testval/1');
    expect(existing).toEqual('#null');
});
it("set and get #exists", () => {
    const existing = Setup_1.run('get testval/2');
    expect(existing).toEqual('#null');
    Setup_1.run('set testval/1');
    const found = Setup_1.run('get testval/2');
    expect(found).toEqual('#exists');
});
it("set and get payload", () => {
    const existing = Setup_1.run('get testval/3 == 123');
    expect(existing).toEqual('#null');
    Setup_1.run('set testval/1');
    const found = Setup_1.run('get testval/3');
    expect(found).toEqual('123');
});
it("overwrite set and get the value", () => {
});
//# sourceMappingURL=SetAndGet.test.js.map