import { CodeFile, resolveSelector } from "..";

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
    const cursor = resolveSelector(
      testFile1,
      "find-ident appleFunc | enter-block"
    );
    expect(cursor.ranges).toMatchInlineSnapshot(`
      Array [
        Object {
          "end": 17,
          "start": 8,
        },
      ]
    `);
  });
});
