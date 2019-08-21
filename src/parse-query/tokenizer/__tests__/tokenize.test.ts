import { tokenizeString, Token, TokenizeResult } from "..";

function consise(result: TokenizeResult) {
  return result.tokens.map((token: any) => {
    token = {
      matchName: token.match && token.match.name,
      ...token
    };
    delete token.match;
    return token;
  });
}

describe("tokenizeString", () => {
  it("handles identifiers", () => {
    expect(consise(tokenizeString("hello-there"))).toMatchInlineSnapshot(`
      Array [
        Object {
          "columnStart": 1,
          "endPos": 11,
          "length": 11,
          "lineStart": 1,
          "matchName": "ident",
          "startPos": 0,
        },
      ]
    `);
    expect(consise(tokenizeString("hello there"))).toMatchInlineSnapshot(`
      Array [
        Object {
          "columnStart": 1,
          "endPos": 5,
          "length": 5,
          "lineStart": 1,
          "matchName": "ident",
          "startPos": 0,
        },
        Object {
          "columnStart": 6,
          "endPos": 6,
          "length": 1,
          "lineStart": 1,
          "matchName": "space",
          "startPos": 5,
        },
        Object {
          "columnStart": 7,
          "endPos": 11,
          "length": 5,
          "lineStart": 1,
          "matchName": "ident",
          "startPos": 6,
        },
      ]
    `);

    expect(consise(tokenizeString("_abc123"))).toMatchInlineSnapshot(`
      Array [
        Object {
          "columnStart": 1,
          "endPos": 7,
          "length": 7,
          "lineStart": 1,
          "matchName": "ident",
          "startPos": 0,
        },
      ]
    `);
  });

  it("handles spaces", () => {
    expect(consise(tokenizeString("  -    "))).toMatchInlineSnapshot(`
      Array [
        Object {
          "columnStart": 1,
          "endPos": 2,
          "length": 2,
          "lineStart": 1,
          "matchName": "space",
          "startPos": 0,
        },
        Object {
          "columnStart": 3,
          "endPos": 3,
          "length": 1,
          "lineStart": 1,
          "matchName": "dash",
          "startPos": 2,
        },
        Object {
          "columnStart": 4,
          "endPos": 7,
          "length": 4,
          "lineStart": 1,
          "matchName": "space",
          "startPos": 3,
        },
      ]
    `);
  });

  it("handles special characters", () => {
    expect(consise(tokenizeString("%$!/"))).toMatchInlineSnapshot(`
      Array [
        Object {
          "columnStart": 1,
          "endPos": 1,
          "length": 1,
          "lineStart": 1,
          "matchName": "percent",
          "startPos": 0,
        },
        Object {
          "columnStart": 2,
          "endPos": 2,
          "length": 1,
          "lineStart": 1,
          "matchName": "dollar",
          "startPos": 1,
        },
        Object {
          "columnStart": 3,
          "endPos": 3,
          "length": 1,
          "lineStart": 1,
          "matchName": "unrecognized",
          "startPos": 2,
        },
        Object {
          "columnStart": 4,
          "endPos": 4,
          "length": 1,
          "lineStart": 1,
          "matchName": "slash",
          "startPos": 3,
        },
      ]
    `);
  });

  xit("handles quoted strings", () => {
    expect(consise(tokenizeString('hello "there" '))).toMatchInlineSnapshot(`
            Array [
              Object {
                "charNumber": 1,
                "endPos": 5,
                "lineNumber": 0,
                "matchName": "ident",
                "startPos": 0,
              },
              Object {
                "charNumber": 6,
                "endPos": 6,
                "lineNumber": 0,
                "matchName": "space",
                "startPos": 5,
              },
              Object {
                "charNumber": 7,
                "endPos": 7,
                "lineNumber": 0,
                "matchName": "unrecognized",
                "startPos": 6,
              },
              Object {
                "charNumber": 8,
                "endPos": 12,
                "lineNumber": 0,
                "matchName": "ident",
                "startPos": 7,
              },
              Object {
                "charNumber": 13,
                "endPos": 13,
                "lineNumber": 0,
                "matchName": "unrecognized",
                "startPos": 12,
              },
              Object {
                "charNumber": 14,
                "endPos": 14,
                "lineNumber": 0,
                "matchName": "space",
                "startPos": 13,
              },
            ]
        `);
  });

  it("provides identifier text", () => {
    const result = tokenizeString("apple banana-cherry");
    expect(result.tokens.length).toEqual(3);
    expect(result.getTokenText(result.tokens[0])).toEqual("apple");
    expect(result.getTokenText(result.tokens[2])).toEqual("banana-cherry");
  });
});
