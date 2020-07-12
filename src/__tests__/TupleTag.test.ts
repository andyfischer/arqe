
import TupleTag from '../TupleTag'

it("setValue removes star and valueExpr", () => {
    const tag = new TupleTag({ attr: 'a', starValue: true });
    const tag2 = tag.setValue('x');
    expect(tag2.value).toEqual('x')
    expect(tag2.starValue).toBeFalsy()
});
