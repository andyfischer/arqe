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
