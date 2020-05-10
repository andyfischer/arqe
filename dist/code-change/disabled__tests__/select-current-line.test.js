"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function toCodeFile(text) {
    const file = new __1.CodeFile();
    file.readString(text);
    return file;
}
it('selects the whole line', () => {
    const file = toCodeFile(`
a = 1
b = 2
c = 3
                            `);
    const cursor = __1.runChangeCommand(file, "find-ident b | select-current-line");
    expect(cursor.getSelectedText()).toEqual("b = 2");
});
//# sourceMappingURL=select-current-line.test.js.map