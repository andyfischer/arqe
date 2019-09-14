import { CodeFile, runChangeCommand } from "..";

function toCodeFile(text: string) {
  const file = new CodeFile();
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
    const cursor = runChangeCommand(
      testFile1,
      "find-ident appleFunc | enter-block"
    );
    expect(cursor.range).toMatchInlineSnapshot(`
      Object {
        "end": 17,
        "start": 8,
      }
    `);
  });
});
