
import { parsePattern } from '../parseCommand'
import { patternToJson } from '../parseObjectToPattern'

it('parses optional attrs', () => {
    const pattern = parsePattern('x y?');
    expect(pattern.tags[1].attr).toEqual('y');
    expect(pattern.tags[1].optional).toEqual(true);
    expect(patternToJson(pattern)).toEqual({
        x: true,
        y: {
            optional: true
        }
    });
});
