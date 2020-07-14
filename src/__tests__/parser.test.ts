
import { parseCommandChain } from '../parseCommand'
import parseTuple from '../parseTuple';

it('parses correctly', () => {
    const chain = parseCommandChain("get x y | join y z");
    expect(chain.commands[0].stringify()).toEqual('get x y');
    expect(chain.commands[1].stringify()).toEqual('join y z');
});

it('parses tag identifiers', () => {
    const pattern = parseTuple("x [from $a] y [from $b] z/1");
    expect(pattern.tags[0].identifier).toBeFalsy();
    expect(pattern.tags[0].attr).toEqual('x');
    expect(pattern.tags[1].identifier).toEqual('a');
    expect(pattern.tags[1].attr).toEqual('y');
    expect(pattern.tags[2].identifier).toEqual('b');
    expect(pattern.tags[2].attr).toEqual('z');
    expect(pattern.tags[2].value).toEqual('1');
});

it('parses exprs', () => {
    const pattern = parseCommandChain("modify a/(increment)").commands[0].toPattern();
    expect(pattern.tags[0].attr).toEqual('a');
    expect(pattern.tags[0].exprValue).toEqual(['increment']);
});

it('parses new style tags', () => {
    const pattern = parseCommandChain("modify a(b)").commands[0].toPattern();
    expect(pattern.tags[0].attr).toEqual('a');
    expect(pattern.tags[0].value).toEqual('b');
});

it('parses complex expressions inside new style tags', () => {
    const pattern = parseCommandChain("set touchpoint/0.6 query(${target} touchpoint/*)").commands[0].toPattern();
    expect(pattern.tags[0].attr).toEqual('touchpoint');
    expect(pattern.tags[0].value).toEqual('0.6');
    expect(pattern.tags[1].attr).toEqual('query');
    expect(pattern.tags[1].value).toEqual('${target} touchpoint/*');
})

it('parses nested parens inside new style tags', () => {
    const pattern = parseCommandChain("set tag(nested (expr) here)").commands[0].toPattern();
    expect(pattern.tags[0].attr).toEqual('tag');
    expect(pattern.tags[0].value).toEqual('nested (expr) here');
});

it('parses unbound attr identifiers', () => {
    const pattern = parseTuple('a x/$b');
    console.log(pattern);
});