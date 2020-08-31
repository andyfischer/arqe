import { patternToJson } from '../parseObjectToPattern'

import parseTuple from '../parseTuple';

it('parses optional attrs', () => {
    const pattern = parseTuple('x y?');
    expect(pattern.tags[1].attr).toEqual('y');
    expect(pattern.tags[1].optional).toEqual(true);
    expect(patternToJson(pattern)).toEqual({
        x: true,
        y: {
            optional: true
        }
    });
});

it('parser handles slashes that are inside parens', () => {
    const pattern = parseTuple('x(y/z)');
    expect(pattern.tags[0].attr).toEqual('x');
    expect(pattern.tags[0].value).toEqual('y/z');
});

it("parser handles attribute names with dots", () => {
    const pattern = parseTuple("a.b c.d/123 e.f(456)");
    expect(pattern.tags[0].attr).toEqual("a.b");
    expect(pattern.tags[1].attr).toEqual("c.d");
})