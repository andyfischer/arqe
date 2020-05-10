"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function toCodeFile(text) {
    const file = new __1.CodeFile();
    file.readString(text);
    return file;
}
it('inserts at the start of the file', () => {
    const file = toCodeFile(`a b c`);
    __1.runChangeCommand(file, "find-ident a | insert new-a");
    expect(file.getText()).toEqual('new-a b c');
});
it('inserts in the middle of the file', () => {
    const file = toCodeFile(`new-a b c`);
    __1.runChangeCommand(file, "find-ident b | insert new-b");
    expect(file.getText()).toEqual('new-a new-b c');
});
it('works correctly after multiple imports', () => {
    const file = toCodeFile(`a b c`);
    __1.runChangeCommand(file, "find-ident a | insert new-a");
    __1.runChangeCommand(file, "find-ident b | insert new-b");
    __1.runChangeCommand(file, "find-ident c | insert new-c");
    expect(file.getText()).toEqual('new-a new-b new-c');
});
//# sourceMappingURL=insert.test.js.map