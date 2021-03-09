
import parseTuple from '../parser/parseTuple';

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

it('parses unbound attr identifiers', () => {
    const pattern = parseTuple('a x/$b');
});
