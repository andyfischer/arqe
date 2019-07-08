import { tokenizeString, Token, TokenizeResult } from '..';

function consise(result: TokenizeResult) {
    return result.tokens.map((token:any) => {
        token = {
            matchName: token.match && token.match.name,
            ...token
        };
        delete token.match;
        return token;
    });
}

describe('tokenizeString', () => {
    it('handles identifiers', () => {
        expect(consise(tokenizeString('hello-there'))).toMatchInlineSnapshot(`
Array [
  Object {
    "charNumber": 1,
    "endPos": 11,
    "lineNumber": 0,
    "matchName": "ident",
    "startPos": 0,
  },
]
`);
        expect(consise(tokenizeString('hello there'))).toMatchInlineSnapshot(`
Array [
  Object {
    "charNumber": 1,
    "endPos": 5,
    "lineNumber": 0,
    "matchName": "ident",
    "startPos": 0,
  },
  Object {
    "charNumber": 11,
    "endPos": 6,
    "lineNumber": 0,
    "matchName": "space",
    "startPos": 5,
  },
  Object {
    "charNumber": 13,
    "endPos": 11,
    "lineNumber": 0,
    "matchName": "ident",
    "startPos": 6,
  },
]
`);

        expect(consise(tokenizeString('_abc123'))).toMatchInlineSnapshot(`
Array [
  Object {
    "charNumber": 1,
    "endPos": 7,
    "lineNumber": 0,
    "matchName": "ident",
    "startPos": 0,
  },
]
`);
    });

    it('handles spaces', () => {
        expect(consise(tokenizeString('  -    '))).toMatchInlineSnapshot(`
Array [
  Object {
    "charNumber": 1,
    "endPos": 2,
    "lineNumber": 0,
    "matchName": "space",
    "startPos": 0,
  },
  Object {
    "charNumber": 5,
    "endPos": 3,
    "lineNumber": 0,
    "matchName": "dash",
    "startPos": 2,
  },
  Object {
    "charNumber": 7,
    "endPos": 7,
    "lineNumber": 0,
    "matchName": "space",
    "startPos": 3,
  },
]
`);
    });

    it('handles special characters', () => {
        expect(consise(tokenizeString('%$!/'))).toMatchInlineSnapshot(`
Array [
  Object {
    "charNumber": 1,
    "endPos": 1,
    "lineNumber": 0,
    "matchName": "percent",
    "startPos": 0,
  },
  Object {
    "charNumber": 3,
    "endPos": 2,
    "lineNumber": 0,
    "matchName": "dollar",
    "startPos": 1,
  },
  Object {
    "charNumber": 5,
    "endPos": 3,
    "lineNumber": 0,
    "matchName": "unrecognized",
    "startPos": 2,
  },
  Object {
    "charNumber": 7,
    "endPos": 4,
    "lineNumber": 0,
    "matchName": "slash",
    "startPos": 3,
  },
]
`);
    });

    it('handles quoted strings', () => {
        expect(consise(tokenizeString('hello "there" ')))
            .toMatchInlineSnapshot(`
Array [
  Object {
    "charNumber": 1,
    "endPos": 5,
    "lineNumber": 0,
    "matchName": "ident",
    "startPos": 0,
  },
  Object {
    "charNumber": 11,
    "endPos": 6,
    "lineNumber": 0,
    "matchName": "space",
    "startPos": 5,
  },
  Object {
    "charNumber": 13,
    "endPos": 7,
    "lineNumber": 0,
    "matchName": "unrecognized",
    "startPos": 6,
  },
  Object {
    "charNumber": 15,
    "endPos": 12,
    "lineNumber": 0,
    "matchName": "ident",
    "startPos": 7,
  },
  Object {
    "charNumber": 25,
    "endPos": 13,
    "lineNumber": 0,
    "matchName": "unrecognized",
    "startPos": 12,
  },
  Object {
    "charNumber": 27,
    "endPos": 14,
    "lineNumber": 0,
    "matchName": "space",
    "startPos": 13,
  },
]
`);
    });

    it('provides identifier text', () => {
        const result = tokenizeString('apple banana-cherry');
        expect(result.tokens.length).toEqual(3);
        expect(result.getTokenText(result.tokens[0])).toEqual('apple');
        expect(result.getTokenText(result.tokens[2])).toEqual('banana-cherry');
    });
});
