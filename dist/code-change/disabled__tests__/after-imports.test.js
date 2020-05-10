"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function toCodeFile(text) {
    const file = new __1.CodeFile();
    file.readString(text);
    return file;
}
function sample() {
    return toCodeFile(`

    import foo
    import something from something

    function hi() {
    }

    `);
}
it("moves the cursor after the last import", () => {
    const file = sample();
    const cursor = __1.runChangeCommand(file, "after-imports");
    expect(cursor.range).toMatchInlineSnapshot(`
        Object {
          "end": 16,
          "start": 16,
        }
    `);
});
it("supports appending a new import", () => {
    const file = sample();
    __1.runChangeCommand(file, "after-imports | insert-line hello");
    expect(file.textContents).toMatchInlineSnapshot(`
    "

        import foo
        import something from something
        hello

        function hi() {
        }

        "
  `);
});
//# sourceMappingURL=after-imports.test.js.map