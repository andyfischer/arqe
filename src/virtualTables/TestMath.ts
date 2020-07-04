
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { } from '../TableInterface'
import { handles } from '../annotations'

export class TestMath implements TableInterface {
    name = 'TestMath'
    schema = 'test-math sum a b'
    supportsCompleteScan = false

    @handles("get test-math a/$a b/$b sum")
    sum(tuple: Tuple, out: Stream) {
        const a = tuple.getVal("a");
        const b = tuple.getVal("b");

        const sum = parseInt(a) + parseInt(b) + '';

        out.next(tuple.setVal("sum", sum));
        out.done();
    }
}
