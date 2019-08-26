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

describe("find-ident", () => {
  it("finds an identifier", () => {
    const cursor = resolveSelector(testFile1, "find-ident appleFunc");
    expect(cursor.ranges).toMatchInlineSnapshot(`
                  Array [
                    Object {
                      "end": 5,
                      "start": 4,
                    },
                  ]
            `);
  });

  it("doesn't find string-based matches", () => {
    const cursor = resolveSelector(testFile1, "find-ident apple");
    expect(cursor.ranges).toEqual([]);
  });

  it("can find multiple matches", () => {
    const cursor = resolveSelector(testFile1, "find-ident bananaFunc");
    expect(cursor.ranges).toMatchInlineSnapshot(`
            Array [
              Object {
                "end": 24,
                "start": 23,
              },
              Object {
                "end": 50,
                "start": 49,
              },
            ]
        `);
  });

  it("supports indentation filters", () => {
    const cursor = resolveSelector(testFile1, "find-ident bananaFunc indent=4");
    expect(cursor.ranges).toMatchInlineSnapshot(`
      Array [
        Object {
          "end": 24,
          "start": 23,
        },
      ]
    `);
  });

  it("can find no matches", () => {
    const cursor = resolveSelector(testFile1, "find-ident xxx");
    expect(cursor.ranges).toEqual([]);
  });
});
