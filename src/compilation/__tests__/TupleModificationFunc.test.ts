
import Relation from '../../Relation'
import { compileTupleModificationFunc } from '../TupleModificationFunc'
import parseTuple from '../../stringFormat/parseTuple'

function equalityTest(start: string, modifier, end: string) {
    const modified = modifier(parseTuple(start));
    expect(modified.stringify()).toEqual(end);
}

it('supports remove-attr instructions', () => {
    equalityTest("a[1] b[2] c[3]", compileTupleModificationFunc(new Relation([
    ])), "a/1 b/2 c/3");

    equalityTest("a[1] b[2] c[3]", compileTupleModificationFunc(new Relation([
        parseTuple('remove-attr[b]')
    ])), "a/1 c/3");

    equalityTest("a[1] b[2] c[3]", compileTupleModificationFunc(new Relation([
        parseTuple('remove-attr[b]'),
        parseTuple('remove-attr[c]')
    ])), "a/1");
});
