
import PatternTag from '../PatternTag'

it("setValue removes star and valueExpr", () => {
    const tag = new PatternTag({ attr: 'a', starValue: true });
    const tag2 = tag.setValue('x');
    expect(tag2.tagValue).toEqual('x')
    expect(tag2.starValue).toBeFalsy()
});