
import Tuple from './Tuple'
import Stream from './Stream'

export type TupleModifier = (tuple: Tuple) => Tuple

export default interface TableInterface {
    name: string
    supportsScan: boolean
    search: (pattern: Tuple, out: Stream) => void
    insert: (tuple: Tuple, out: Stream) => void
    updatev2: (search: Tuple, modifier: TupleModifier, out: Stream) => void
    deletev2: (search: Tuple, out: Stream) => void

}

