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

describe("find-ident", () => {
  it("finds an identifier", () => {
    const cursor = runChangeCommand(testFile1, "find-ident appleFunc");
    expect(cursor.range).toMatchInlineSnapshot(`
      Object {
        "end": 5,
        "start": 4,
      }
    `);
  });

  it("doesn't find string-based matches", () => {
    const cursor = runChangeCommand(testFile1, "find-ident apple");
    expect(cursor.range).toBeFalsy();
  });

  it("supports indentation filters", () => {
    const cursor = runChangeCommand(
      testFile1,
      "find-ident bananaFunc indent=4"
    );
    expect(cursor.range).toMatchInlineSnapshot(`
      Object {
        "end": 24,
        "start": 23,
      }
    `);
  });

  it("can find no matches", () => {
    const cursor = runChangeCommand(testFile1, "find-ident xxx");
    expect(cursor.range).toBeFalsy();
  });
});
