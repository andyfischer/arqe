
import { tokenizeString, Token, LexedText, t_line_comment } from "..";

it('pairs braces', () => {
    const lexed = tokenizeString('{ }');
    expect(lexed.tokens.length).toEqual(3);
    expect(lexed.tokens[0].pairsWithIndex).toEqual(2);
    expect(lexed.tokens[2].pairsWithIndex).toEqual(0);
});
