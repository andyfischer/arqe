
import Tuple from './Tuple'
import Stream from './Stream'
import TupleModification from './TupleModification'
import TableListener from './TableListener'
import TuplePatternMatcher from './TuplePatternMatcher'
import NativeHandler from './NativeHandler'
import CommandPatternMatcher from './CommandPatternMatcher'

export default interface TableStorage {
    select?: (pattern: Tuple, out: Stream) => void
    insert?: (tuple: Tuple, out: Stream) => void
    update?: (update: Tuple, out: Stream) => void
    delete?: (search: Tuple, out: Stream) => void
}
