"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function toCodeFile(text) {
    const file = new __1.CodeFile();
    file.readString(text);
    return file;
}
const testFile1 = toCodeFile(`
    function appleFunc() {
       abc();
    }

    function bananaFunc() {
       abc();
    }

    function main() {
        bananaFunc();
    }
`);
describe("enter-block", () => {
    it("enters a block", () => {
        const cursor = __1.runChangeCommand(testFile1, "find-ident appleFunc | enter-block");
        expect(cursor.range).toMatchInlineSnapshot(`
      Object {
        "end": 17,
        "start": 8,
      }
    `);
    });
});
//# sourceMappingURL=enter-block.test.js.map