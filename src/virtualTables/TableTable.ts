
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { TupleModifier } from '../TableInterface'

export class Glob implements TableInterface {
    name = 'TableTable'
    supportsCompleteScan: false
    schema = 'table name'

    search(pattern: Tuple, out: Stream) {
    }
    insert(pattern: Tuple, out: Stream) {
        throw new Error('insert not supported');
    }
    update(pattern: Tuple, modifier: TupleModifier, out: Stream) {
        throw new Error('update not supported');
    }
    delete(pattern: Tuple, out: Stream) {
        throw new Error('delete not supported');
    }
}
