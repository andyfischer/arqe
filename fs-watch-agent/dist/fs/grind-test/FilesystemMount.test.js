"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const _1 = require(".");
_1.test("filesystem mount works", async ({ run }) => {
    const id = 'filesystem-mount/124';
    const dir = path_1.default.resolve(__dirname, 'filesystem-mount-test');
    await run(`set ${id}`);
    await run(`set ${id} .directory == ${dir}`);
    const list = await run(`get -list ${id} filename/*`);
    expect(list).toEqual([
        'filename/file1.txt',
        'filename/file2.txt'
    ]);
});
//# sourceMappingURL=FilesystemMount.test.js.map