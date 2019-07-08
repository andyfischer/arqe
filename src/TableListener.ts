
import Tuple from './Tuple'
import Stream from './Stream'
import TupleModification from './TupleModification'

export default interface TableListener {
    insert: (tuple: Tuple) => void
    delete: (search: Tuple) => void
    update: (from: Tuple, to: Tuple) => void
}
