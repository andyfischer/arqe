"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function toCodeFile(text) {
    const file = new __1.CodeFile();
    file.readString(text);
    return file;
}
it('select-line selects the line', () => {
    const file = toCodeFile(`a = 1\nb = 2\nc = 3`);
    __1.runChangeCommand(file, "select-line 2 | delete");
    expect(file.getText()).toEqual(`a = 1\nc = 3`);
});
//# sourceMappingURL=select-line.test.js.map