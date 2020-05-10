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
xit("handles single quote strings", () => {
    const tokens = consise(__1.tokenizeString('"there"'));
    expect(tokens[0].matchName).toEqual("quoted_string");
    expect(tokens.length).toEqual(1);
});
xit("handles double quote strings", () => {
    const tokens = consise(__1.tokenizeString("'there'"));
    expect(tokens[0].matchName).toEqual("quoted_string");
    expect(tokens.length).toEqual(1);
});
xit("handles quotes inside strings", () => {
    const result = __1.tokenizeString(`"contains a 'quoted' section"`);
    const tokens = result.tokens;
    expect(tokens[0].match.name).toEqual("quoted_string");
    expect(result.getTokenText(result.tokens[0])).toEqual(`"contains a 'quoted' section"`);
    expect(tokens.length).toEqual(1);
});
xit("handles escaped quotes inside strings", () => {
    const result = __1.tokenizeString(`"the \\" character"`);
    const tokens = result.tokens;
    expect(tokens[0].match.name).toEqual("quoted_string");
    expect(result.getTokenText(result.tokens[0])).toEqual(`"the \\" character"`);
    expect(tokens.length).toEqual(1);
});
xdescribe('getUnquotedText', () => {
    it("gets the correct string", () => {
        const result = __1.tokenizeString(`"the string"`);
        const tokens = result.tokens;
        expect(result.getUnquotedText(result.tokens[0])).toEqual("the string");
    });
    it("unescapes", () => {
        const result = __1.tokenizeString(`"the \\" character"`);
        const tokens = result.tokens;
        expect(result.getUnquotedText(result.tokens[0])).toEqual(`the " character`);
    });
    it("unescapes multiple", () => {
        const result = __1.tokenizeString(`"\\a \\b \\c \\d \\e"`);
        const tokens = result.tokens;
        expect(result.getUnquotedText(result.tokens[0])).toEqual(`a b c d e`);
    });
});
//# sourceMappingURL=tokenizeQuotedStrings.test.js.map