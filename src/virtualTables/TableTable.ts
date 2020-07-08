
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { } from '../TableInterface'

export class Glob implements TableInterface {
    name = 'TableTable'
    supportsCompleteScan: false
    schema = 'table name'

    select(pattern: Tuple, out: Stream) {
    }
    insert(pattern: Tuple, out: Stream) {
        throw new Error('insert not supported');
    }
    delete(pattern: Tuple, out: Stream) {
        throw new Error('delete not supported');
    }
}