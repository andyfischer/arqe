
import Tag from '../Tag'
import parseTuple from '../parser/parseTuple'

it("setValue removes star and valueExpr", () => {
    const tag = new Tag({ attr: 'a', starValue: true });
    const tag2 = tag.setValue('x');
    expect(tag2.value).toEqual('x')
    expect(tag2.starValue).toBeFalsy()
});

it("getTupleVerb returns correct value", () => {
    const t = parseTuple('a/123 b(unique)');

    expect(t.getTag('a').getTupleVerb()).toEqual(null);
    expect(t.getTag('b').getTupleVerb()).toEqual('unique');
});

