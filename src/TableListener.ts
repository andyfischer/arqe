
import Tuple from './Tuple'
import Stream from './Stream'

export default interface TableListener {
    insert: (tuple: Tuple, out: Stream) => void
    delete: (search: Tuple, out: Stream) => void
}
