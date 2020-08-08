
import Tuple from './Tuple'

export default interface TableListener {
    insert: (tuple: Tuple) => void
    delete: (search: Tuple) => void
    update: (from: Tuple, to: Tuple) => void
}
