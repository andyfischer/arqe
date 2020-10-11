
import Tuple from '../Tuple'
import parseTuple from '../stringFormat/parseTuple'
import objectToTuple, { tupleToJson } from '../objectToTuple'

function circularTest(tuple: Tuple) {
    const obj = tupleToJson(tuple);
    const reparsedObject = JSON.parse(JSON.stringify(obj));
    const backToTuple = objectToTuple(reparsedObject);

    expect(tuple.stringify()).toEqual(backToTuple.stringify());

}

it('works for attr-only tuples', () => {
    circularTest(parseTuple("a"))
});
