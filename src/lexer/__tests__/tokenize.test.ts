import { tokenizeString, Token, TokenizeResult, t_line_comment } from "..";

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

it("handles identifiers", () => {
  expect(consise(tokenizeString("hello-there"))).toMatchInlineSnapshot(`
    Array [
      Object {
        "columnStart": 1,
        "endPos": 11,
        "leadingIndent": 0,
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
        "leadingIndent": 0,
        "length": 5,
        "lineStart": 1,
        "matchName": "ident",
        "startPos": 0,
      },
      Object {
        "columnStart": 6,
        "endPos": 6,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "space",
        "startPos": 5,
      },
      Object {
        "columnStart": 7,
        "endPos": 11,
        "leadingIndent": 0,
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
        "leadingIndent": 0,
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
        "leadingIndent": 2,
        "length": 2,
        "lineStart": 1,
        "matchName": "space",
        "startPos": 0,
      },
      Object {
        "columnStart": 3,
        "endPos": 3,
        "leadingIndent": 2,
        "length": 1,
        "lineStart": 1,
        "matchName": "dash",
        "startPos": 2,
      },
      Object {
        "columnStart": 4,
        "endPos": 7,
        "leadingIndent": 2,
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
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "percent",
        "startPos": 0,
      },
      Object {
        "columnStart": 2,
        "endPos": 2,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "dollar",
        "startPos": 1,
      },
      Object {
        "columnStart": 3,
        "endPos": 3,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "unrecognized",
        "startPos": 2,
      },
      Object {
        "columnStart": 4,
        "endPos": 4,
        "leadingIndent": 0,
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

it("handles line comments", () => {
  const result = tokenizeString("apple # banana");
  expect(result.tokens.length).toEqual(3);
  expect(result.getTokenText(result.tokens[0])).toEqual("apple");
  expect(result.tokens[2].match).toEqual(t_line_comment);
  expect(result.getTokenText(result.tokens[2])).toEqual("# banana");
});

it("handles line comments 2", () => {
  const result = tokenizeString("apple # banana\nsecond line");
  expect(result.tokens).toMatchInlineSnapshot(`
    Array [
      Object {
        "columnStart": 1,
        "endPos": 5,
        "leadingIndent": 0,
        "length": 5,
        "lineStart": 1,
        "match": Object {
          "name": "ident",
        },
        "startPos": 0,
      },
      Object {
        "columnStart": 6,
        "endPos": 6,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "match": Object {
          "name": "space",
        },
        "startPos": 5,
      },
      Object {
        "columnStart": 7,
        "endPos": 14,
        "leadingIndent": 0,
        "length": 8,
        "lineStart": 1,
        "match": Object {
          "name": "line_comment",
        },
        "startPos": 6,
      },
      Object {
        "columnStart": 15,
        "endPos": 15,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "match": Object {
          "name": "newline",
          "str": "
    ",
        },
        "startPos": 14,
      },
      Object {
        "columnStart": 1,
        "endPos": 21,
        "leadingIndent": 0,
        "length": 6,
        "lineStart": 2,
        "match": Object {
          "name": "ident",
        },
        "startPos": 15,
      },
      Object {
        "columnStart": 7,
        "endPos": 22,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 2,
        "match": Object {
          "name": "space",
        },
        "startPos": 21,
      },
      Object {
        "columnStart": 8,
        "endPos": 26,
        "leadingIndent": 0,
        "length": 4,
        "lineStart": 2,
        "match": Object {
          "name": "ident",
        },
        "startPos": 22,
      },
    ]
  `);
});
