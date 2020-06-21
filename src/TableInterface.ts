
import Tuple from './Tuple'
import Stream from './Stream'
import GenericStream from './GenericStream'

export default interface TableInterface {
    name: string
    supportsScan: boolean
    search: (pattern: Tuple, out: Stream) => void
    scan: (out: GenericStream<{slotId: string, tuple: Tuple}>) => void
    insert: (tuple: Tuple, out: Stream) => void
    update: (slotId: string, tuple: Tuple, out: Stream) => void
    delete: (slotId: string, out: Stream) => void
}

