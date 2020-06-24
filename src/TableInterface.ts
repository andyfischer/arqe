
import Tuple from './Tuple'
import Stream from './Stream'

export type TupleModifier = (tuple: Tuple) => Tuple

export default interface TableInterface {
    name: string
    supportsScan: boolean
    search: (pattern: Tuple, out: Stream) => void
    insert: (tuple: Tuple, out: Stream) => void
    update: (search: Tuple, modifier: TupleModifier, out: Stream) => void
    delete: (search: Tuple, out: Stream) => void
}

