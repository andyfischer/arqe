
import Tuple from './Tuple'
import Stream from './Stream'
import GenericStream from './GenericStream'

export type TupleModifier = (tuple: Tuple) => Tuple

export default interface TableInterface {
    name: string
    supportsScan: boolean
    search: (pattern: Tuple, out: Stream) => void
    scan: (out: GenericStream<{slotId: string, tuple: Tuple}>) => void
    insert: (tuple: Tuple, out: Stream) => void
    updatev2: (search: Tuple, modifier: TupleModifier, out: Stream) => void
    delete: (slotId: string, out: Stream) => void
    deletev2: (search: Tuple, out: Stream) => void

}

