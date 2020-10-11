
import TupleTag from '../TupleTag'
import parseTuple from '../stringFormat/parseTuple'
import { isUniqueTag } from '../knownTags'

it("setValue removes star and valueExpr", () => {
    const tag = new TupleTag({ attr: 'a', starValue: true });
    const tag2 = tag.setValue('x');
    expect(tag2.value).toEqual('x')
    expect(tag2.starValue).toBeFalsy()
});

it("isUniqueExpr returns correct value", () => {
    const t = parseTuple('a/123 b(unique)');

    expect(isUniqueTag(t.getTag('a'))).toEqual(false);
    expect(isUniqueTag(t.getTag('b'))).toEqual(true);
});

