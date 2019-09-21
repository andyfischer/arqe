
import { tokenizeString, Token, LexedText, t_line_comment } from "..";

function consise(result: LexedText) {
  return result.tokens.map((token: any) => {
    token = {
      matchName: token.match && token.match.name,
      ...token
    };
    delete token.match;
    return token;
  });
}

it("handles single quote strings", () => {
  const tokens = consise(tokenizeString('"there"'));
  expect(tokens[0].matchName).toEqual("quoted_string");
  expect(tokens.length).toEqual(1);
});

it("handles double quote strings", () => {
  const tokens = consise(tokenizeString("'there'"));
  expect(tokens[0].matchName).toEqual("quoted_string");
  expect(tokens.length).toEqual(1);
});

it("handles quotes inside strings", () => {
  const result = tokenizeString(`"contains a 'quoted' section"`);
  const tokens = result.tokens;
  expect(tokens[0].match.name).toEqual("quoted_string");
  expect(result.getTokenText(result.tokens[0])).toEqual(`"contains a 'quoted' section"`);
  expect(tokens.length).toEqual(1);
});

it("handles escaped quotes inside strings", () => {
  const result = tokenizeString(`"the \\" character"`);
  const tokens = result.tokens;
  expect(tokens[0].match.name).toEqual("quoted_string");
  expect(result.getTokenText(result.tokens[0])).toEqual(`"the \\" character"`);
  expect(tokens.length).toEqual(1);
});

describe('getUnquotedString', () => {
    it("gets the correct string", () => {
        const result = tokenizeString(`"the string"`);
        const tokens = result.tokens;
        expect(result.getUnquotedString(result.tokens[0])).toEqual("the string");
    });
    
    it("unescapes", () => {
        const result = tokenizeString(`"the \\" character"`);
        const tokens = result.tokens;
        expect(result.getUnquotedString(result.tokens[0])).toEqual(`the " character`);
    });

    it("unescapes multiple", () => {
        const result = tokenizeString(`"\\a \\b \\c \\d \\e"`);
        const tokens = result.tokens;
        expect(result.getUnquotedString(result.tokens[0])).toEqual(`a b c d e`);
    });
});
