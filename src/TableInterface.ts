
import Tuple from './Tuple'
import Stream from './Stream'
import TupleModification from './TupleModification'

export default interface TableInterface {
    name: string
    supportsCompleteScan: boolean
    search: (pattern: Tuple, out: Stream) => void
    insert: (tuple: Tuple, out: Stream) => void
    update?: (search: Tuple, modifier: TupleModification, out: Stream) => void
    delete: (search: Tuple, out: Stream) => void
}
