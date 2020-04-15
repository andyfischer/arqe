
import { parsePattern, parseCommandChain } from '../parseCommand'

it('parses correctly', () => {
    const chain = parseCommandChain("get x y | join y z");
    expect(chain.commands[0].stringify()).toEqual('get x y');
    expect(chain.commands[1].stringify()).toEqual('join y z');
});

it('parses tag identifiers', () => {
    const pattern = parsePattern("x [from $a] y [from $b] z/1");
    expect(pattern.tags[0].identifier).toBeFalsy();
    expect(pattern.tags[0].tagType).toEqual('x');
    expect(pattern.tags[1].identifier).toEqual('a');
    expect(pattern.tags[1].tagType).toEqual('y');
    expect(pattern.tags[2].identifier).toEqual('b');
    expect(pattern.tags[2].tagType).toEqual('z');
    expect(pattern.tags[2].tagValue).toEqual('1');
});

it('parses exprs', () => {
    const pattern = parseCommandChain("modify a/(increment)").commands[0].toPattern();
    expect(pattern.tags[0].tagType).toEqual('a');
    expect(pattern.tags[0].valueExpr).toEqual(['increment']);
});

it('parses new style tags', () => {
    const pattern = parseCommandChain("modify a(b)").commands[0].toPattern();
    expect(pattern.tags[0].tagType).toEqual('a');
    expect(pattern.tags[0].tagValue).toEqual('b');
});
