
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { TupleModifier } from '../TableInterface'

export class TestMath implements TableInterface {
    name = 'TestMath'
    schema = 'test-math sum a b'
    supportsCompleteScan = false

    search(pattern: Tuple, out: Stream) {
        const a = pattern.getVal("a");
        const b = pattern.getVal("b");

        const sum = parseInt(a) + parseInt(b) + '';

        out.next(pattern.setVal("sum", sum));
        out.done();
    }

    insert(tuple: Tuple, out: Stream) {
        throw new Error("not supported");
    }
    update(search: Tuple, modifier: TupleModifier, out: Stream) {
        throw new Error("not supported");
    }
    delete(search: Tuple, out: Stream) {
        throw new Error("not supported");
    }
}
