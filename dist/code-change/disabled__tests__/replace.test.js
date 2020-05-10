"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function toCodeFile(text) {
    const file = new __1.CodeFile();
    file.readString(text);
    return file;
}
it('replace replaces', () => {
    const file = toCodeFile('a = 1');
    __1.runChangeCommand(file, 'replace from=a to=b');
    expect(file.getText()).toEqual('b = 1');
});
it('replace only replaces inside selection', () => {
    const file = toCodeFile('a = 1\na = 2');
    __1.runChangeCommand(file, 'select-line 2 | replace from=a to=b');
    expect(file.getText()).toEqual('a = 1\nb = 2');
});
//# sourceMappingURL=replace.test.js.map