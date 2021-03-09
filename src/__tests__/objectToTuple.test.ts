
import Tuple, { objectToTuple, tupleToJson } from '../Tuple'
import parseTuple from '../parser/parseTuple'

function circularTest(tuple: Tuple) {
    const obj = tupleToJson(tuple);
    const reparsedObject = JSON.parse(JSON.stringify(obj));
    const backToTuple = objectToTuple(reparsedObject);

    expect(tuple.stringify()).toEqual(backToTuple.stringify());
}

it('works for attr-only tuples', () => {
    circularTest(parseTuple("a"))
});
