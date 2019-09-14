import { CodeFile, runChangeCommand } from "..";

function toCodeFile(text: string) {
  const file = new CodeFile();
  file.readString(text);
  return file;
}

it("moves the cursor after the last import", () => {
  const file = toCodeFile(`

    import foo
    import something from something

    function hi() {
    }

    `);

  const cursor = runChangeCommand(file, "after-imports");
  expect(cursor.ranges).toMatchInlineSnapshot(`
    Array [
      Object {
        "end": 31,
        "start": 0,
      },
    ]
  `);
});
