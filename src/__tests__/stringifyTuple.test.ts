import { Tuple } from ".."
import Relation from "../Relation";
import parseTuple from "../parseTuple";

it('works for simple tuples', () => {
    let t = new Tuple([]).addSimpleTag('test', '1');
    expect(t.stringify()).toEqual('test/1')

    t = t.addSimpleTag('test2', 'xyz')
    expect(t.stringify()).toEqual('test/1 test2/xyz')
})

it('works for relation-valued tags', () => {
    const rel = new Relation([parseTuple('a/1')]);
    let t = new Tuple([]).addSimpleTag('rel', rel);

    expect(t.stringify()).toEqual('rel([a/1])')
})