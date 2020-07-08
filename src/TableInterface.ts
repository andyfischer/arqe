
import Tuple from './Tuple'
import Stream from './Stream'
import TupleModification from './TupleModification'
import TableListener from './TableListener'
import TuplePatternMatcher from './TuplePatternMatcher'
import NativeHandler from './NativeHandler'
import CommandPatternMatcher from './CommandPatternMatcher'

export default interface TableInterface {
    name: string
    supportsCompleteScan: boolean
    handlers?: CommandPatternMatcher<NativeHandler>

    select?: (pattern: Tuple, out: Stream) => void
    insert?: (tuple: Tuple, out: Stream) => void
    update?: (search: Tuple, modifier: TupleModification, out: Stream) => void
    delete?: (search: Tuple, out: Stream) => void

    addListener?: (id: string, listener: TableListener) => void
    removeListener?: (id: string, listener: TableListener) => void
}
