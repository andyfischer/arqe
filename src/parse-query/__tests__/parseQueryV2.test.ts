//import { parseString } from "../parseQueryV2";

xit('', () => {});

/*
it("handles a simple query", () => {
  const parsed = parseString("test 1 2 3", "statement");

  expect(parsed).toMatchInlineSnapshot(`
        ParsedQuery {
          "exprs": Object {
            "1": QueryExpr {
              "args": Array [
                Object {
                  "keyword": "test",
                  "lhsName": null,
                  "rhsValue": null,
                },
                Object {
                  "keyword": "1",
                  "lhsName": null,
                  "rhsValue": null,
                },
                Object {
                  "keyword": "2",
                  "lhsName": null,
                  "rhsValue": null,
                },
                Object {
                  "keyword": "3",
                  "lhsName": null,
                  "rhsValue": null,
                },
              ],
              "id": 1,
              "isStatement": true,
              "parent": [Circular],
              "sourcePos": Object {
                "columnEnd": 11,
                "columnStart": 10,
                "lineEnd": 1,
                "lineStart": 1,
                "posEnd": 9,
                "posStart": 0,
              },
              "statementIndent": 0,
              "type": "query",
            },
          },
          "statementId": 1,
        }
    `);
});

it("handles a query with key=value pairs", () => {
  const parsed = parseString("test a=1 b c = 2 ", "statement");

  expect(parsed).toMatchInlineSnapshot(`
        ParsedQuery {
          "exprs": Object {
            "1": QueryExpr {
              "args": Array [
                Object {
                  "keyword": "test",
                  "lhsName": null,
                  "rhsValue": null,
                },
                Object {
                  "keyword": null,
                  "lhsName": "a",
                  "rhsValue": "1",
                },
                Object {
                  "keyword": "b",
                  "lhsName": null,
                  "rhsValue": null,
                },
                Object {
                  "keyword": null,
                  "lhsName": "c",
                  "rhsValue": "2",
                },
              ],
              "id": 1,
              "isStatement": true,
              "parent": [Circular],
              "sourcePos": Object {
                "columnEnd": 18,
                "columnStart": 17,
                "lineEnd": 1,
                "lineStart": 1,
                "posEnd": 16,
                "posStart": 0,
              },
              "statementIndent": 0,
              "type": "query",
            },
          },
          "statementId": 1,
        }
    `);
});

it("handles a simple pipe expr", () => {
  const parsed = parseString("a | b", "statement");

  expect(parsed).toMatchInlineSnapshot(`
    ParsedQuery {
      "exprs": Object {
        "1": QueryExpr {
          "args": Array [
            Object {
              "keyword": "a",
              "lhsName": null,
              "rhsValue": null,
            },
          ],
          "id": 1,
          "parent": [Circular],
          "sourcePos": Object {
            "columnEnd": 3,
            "columnStart": 2,
            "lineEnd": 1,
            "lineStart": 1,
            "posEnd": 1,
            "posStart": 0,
          },
          "type": "query",
        },
        "2": QueryExpr {
          "args": Array [
            Object {
              "keyword": "b",
              "lhsName": null,
              "rhsValue": null,
            },
          ],
          "id": 2,
          "parent": [Circular],
          "sourcePos": Object {
            "columnEnd": 6,
            "columnStart": 5,
            "lineEnd": 1,
            "lineStart": 1,
            "posEnd": 4,
            "posStart": 3,
          },
          "type": "query",
        },
        "3": PipedExpr {
          "id": 3,
          "isStatement": true,
          "itemIds": Array [
            1,
            2,
          ],
          "parent": [Circular],
          "sourcePos": Object {
            "columnEnd": 6,
            "columnStart": 5,
            "lineEnd": 1,
            "lineStart": 1,
            "posEnd": 4,
            "posStart": 0,
          },
          "statementIndent": 0,
          "type": "piped",
        },
      },
      "statementId": 3,
    }
  `);
});

it("handles a more complicated pipe expr", () => {
  const parsed = parseString("test a=1 | b c | d", "statement");

  expect(parsed).toMatchInlineSnapshot(`
    ParsedQuery {
      "exprs": Object {
        "1": QueryExpr {
          "args": Array [
            Object {
              "keyword": "test",
              "lhsName": null,
              "rhsValue": null,
            },
            Object {
              "keyword": null,
              "lhsName": "a",
              "rhsValue": "1",
            },
          ],
          "id": 1,
          "parent": [Circular],
          "sourcePos": Object {
            "columnEnd": 10,
            "columnStart": 9,
            "lineEnd": 1,
            "lineStart": 1,
            "posEnd": 8,
            "posStart": 0,
          },
          "type": "query",
        },
        "2": QueryExpr {
          "args": Array [
            Object {
              "keyword": "b",
              "lhsName": null,
              "rhsValue": null,
            },
            Object {
              "keyword": "c",
              "lhsName": null,
              "rhsValue": null,
            },
          ],
          "id": 2,
          "parent": [Circular],
          "sourcePos": Object {
            "columnEnd": 16,
            "columnStart": 15,
            "lineEnd": 1,
            "lineStart": 1,
            "posEnd": 14,
            "posStart": 10,
          },
          "type": "query",
        },
        "3": QueryExpr {
          "args": Array [
            Object {
              "keyword": "d",
              "lhsName": null,
              "rhsValue": null,
            },
          ],
          "id": 3,
          "parent": [Circular],
          "sourcePos": Object {
            "columnEnd": 19,
            "columnStart": 18,
            "lineEnd": 1,
            "lineStart": 1,
            "posEnd": 17,
            "posStart": 16,
          },
          "type": "query",
        },
        "4": PipedExpr {
          "id": 4,
          "isStatement": true,
          "itemIds": Array [
            1,
            2,
            3,
          ],
          "parent": [Circular],
          "sourcePos": Object {
            "columnEnd": 19,
            "columnStart": 18,
            "lineEnd": 1,
            "lineStart": 1,
            "posEnd": 17,
            "posStart": 0,
          },
          "statementIndent": 0,
          "type": "piped",
        },
      },
      "statementId": 4,
    }
  `);
});
*/
