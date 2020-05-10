"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function consise(result) {
    return result.tokens.map((token) => {
        token = {
            matchName: token.match && token.match.name,
            ...token
        };
        delete token.match;
        return token;
    });
}
it("handles identifiers", () => {
    expect(consise(__1.tokenizeString("hello-there"))).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "columnStart": 1,
                    "endPos": 11,
                    "leadingIndent": 0,
                    "length": 11,
                    "lineStart": 1,
                    "matchName": "ident",
                    "startPos": 0,
                    "tokenIndex": 0,
                  },
                ]
        `);
    expect(consise(__1.tokenizeString("hello there"))).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "columnStart": 1,
                    "endPos": 5,
                    "leadingIndent": 0,
                    "length": 5,
                    "lineStart": 1,
                    "matchName": "ident",
                    "startPos": 0,
                    "tokenIndex": 0,
                  },
                  Object {
                    "columnStart": 6,
                    "endPos": 6,
                    "leadingIndent": 0,
                    "length": 1,
                    "lineStart": 1,
                    "matchName": "space",
                    "startPos": 5,
                    "tokenIndex": 1,
                  },
                  Object {
                    "columnStart": 7,
                    "endPos": 11,
                    "leadingIndent": 0,
                    "length": 5,
                    "lineStart": 1,
                    "matchName": "ident",
                    "startPos": 6,
                    "tokenIndex": 2,
                  },
                ]
        `);
    expect(consise(__1.tokenizeString("_abc123"))).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "columnStart": 1,
                    "endPos": 7,
                    "leadingIndent": 0,
                    "length": 7,
                    "lineStart": 1,
                    "matchName": "ident",
                    "startPos": 0,
                    "tokenIndex": 0,
                  },
                ]
        `);
});
it("handles spaces", () => {
    expect(consise(__1.tokenizeString("  -    "))).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "columnStart": 1,
                    "endPos": 2,
                    "leadingIndent": 2,
                    "length": 2,
                    "lineStart": 1,
                    "matchName": "space",
                    "startPos": 0,
                    "tokenIndex": 0,
                  },
                  Object {
                    "columnStart": 3,
                    "endPos": 3,
                    "leadingIndent": 2,
                    "length": 1,
                    "lineStart": 1,
                    "matchName": "dash",
                    "startPos": 2,
                    "tokenIndex": 1,
                  },
                  Object {
                    "columnStart": 4,
                    "endPos": 7,
                    "leadingIndent": 2,
                    "length": 4,
                    "lineStart": 1,
                    "matchName": "space",
                    "startPos": 3,
                    "tokenIndex": 2,
                  },
                ]
        `);
});
it("handles special characters", () => {
    expect(consise(__1.tokenizeString("%$!/"))).toMatchInlineSnapshot(`
    Array [
      Object {
        "columnStart": 1,
        "endPos": 1,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "percent",
        "startPos": 0,
        "tokenIndex": 0,
      },
      Object {
        "columnStart": 2,
        "endPos": 2,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "dollar",
        "startPos": 1,
        "tokenIndex": 1,
      },
      Object {
        "columnStart": 3,
        "endPos": 3,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "exclamation",
        "startPos": 2,
        "tokenIndex": 2,
      },
      Object {
        "columnStart": 4,
        "endPos": 4,
        "leadingIndent": 0,
        "length": 1,
        "lineStart": 1,
        "matchName": "slash",
        "startPos": 3,
        "tokenIndex": 3,
      },
    ]
  `);
});
it("provides identifier text", () => {
    const result = __1.tokenizeString("apple banana-cherry");
    expect(result.tokens.length).toEqual(3);
    expect(result.getTokenText(result.tokens[0])).toEqual("apple");
    expect(result.getTokenText(result.tokens[2])).toEqual("banana-cherry");
});
it("handles line comments", () => {
    const result = __1.tokenizeString("apple # banana");
    expect(result.tokens.length).toEqual(3);
    expect(result.getTokenText(result.tokens[0])).toEqual("apple");
    expect(result.tokens[2].match).toEqual(__1.t_line_comment);
    expect(result.getTokenText(result.tokens[2])).toEqual("# banana");
});
it("handles line comments 2", () => {
    const result = __1.tokenizeString("apple # banana\nsecond line");
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
                    "tokenIndex": 0,
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
                    "tokenIndex": 1,
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
                    "tokenIndex": 2,
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
                    "tokenIndex": 3,
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
                    "tokenIndex": 4,
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
                    "tokenIndex": 5,
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
                    "tokenIndex": 6,
                  },
                ]
        `);
});
it("finds matching brackets", () => {
    expect(consise(__1.tokenizeString("{ 1 2 3 ( 5 ) [ 6 7 ] }")))
        .toMatchInlineSnapshot(`
        Array [
          Object {
            "columnStart": 1,
            "endPos": 1,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "lbrace",
            "pairsWithIndex": 22,
            "startPos": 0,
            "tokenIndex": 0,
          },
          Object {
            "columnStart": 2,
            "endPos": 2,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 1,
            "tokenIndex": 1,
          },
          Object {
            "columnStart": 3,
            "endPos": 3,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "integer",
            "startPos": 2,
            "tokenIndex": 2,
          },
          Object {
            "columnStart": 4,
            "endPos": 4,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 3,
            "tokenIndex": 3,
          },
          Object {
            "columnStart": 5,
            "endPos": 5,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "integer",
            "startPos": 4,
            "tokenIndex": 4,
          },
          Object {
            "columnStart": 6,
            "endPos": 6,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 5,
            "tokenIndex": 5,
          },
          Object {
            "columnStart": 7,
            "endPos": 7,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "integer",
            "startPos": 6,
            "tokenIndex": 6,
          },
          Object {
            "columnStart": 8,
            "endPos": 8,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 7,
            "tokenIndex": 7,
          },
          Object {
            "columnStart": 9,
            "endPos": 9,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "lparen",
            "pairsWithIndex": 12,
            "startPos": 8,
            "tokenIndex": 8,
          },
          Object {
            "columnStart": 10,
            "endPos": 10,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 9,
            "tokenIndex": 9,
          },
          Object {
            "columnStart": 11,
            "endPos": 11,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "integer",
            "startPos": 10,
            "tokenIndex": 10,
          },
          Object {
            "columnStart": 12,
            "endPos": 12,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 11,
            "tokenIndex": 11,
          },
          Object {
            "columnStart": 13,
            "endPos": 13,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "rparen",
            "pairsWithIndex": 8,
            "startPos": 12,
            "tokenIndex": 12,
          },
          Object {
            "columnStart": 14,
            "endPos": 14,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 13,
            "tokenIndex": 13,
          },
          Object {
            "columnStart": 15,
            "endPos": 15,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "lbracket",
            "pairsWithIndex": 20,
            "startPos": 14,
            "tokenIndex": 14,
          },
          Object {
            "columnStart": 16,
            "endPos": 16,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 15,
            "tokenIndex": 15,
          },
          Object {
            "columnStart": 17,
            "endPos": 17,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "integer",
            "startPos": 16,
            "tokenIndex": 16,
          },
          Object {
            "columnStart": 18,
            "endPos": 18,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 17,
            "tokenIndex": 17,
          },
          Object {
            "columnStart": 19,
            "endPos": 19,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "integer",
            "startPos": 18,
            "tokenIndex": 18,
          },
          Object {
            "columnStart": 20,
            "endPos": 20,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 19,
            "tokenIndex": 19,
          },
          Object {
            "columnStart": 21,
            "endPos": 21,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "rbracket",
            "pairsWithIndex": 14,
            "startPos": 20,
            "tokenIndex": 20,
          },
          Object {
            "columnStart": 22,
            "endPos": 22,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "space",
            "startPos": 21,
            "tokenIndex": 21,
          },
          Object {
            "columnStart": 23,
            "endPos": 23,
            "leadingIndent": 0,
            "length": 1,
            "lineStart": 1,
            "matchName": "rbrace",
            "pairsWithIndex": 0,
            "startPos": 22,
            "tokenIndex": 22,
          },
        ]
    `);
});
