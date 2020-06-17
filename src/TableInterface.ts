
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'

export interface Stream<T> {
    receive: (val: T) => void
    finish: () => void
}

export default interface TableInterface {
    scan: (out: Stream<{slotId: string, tuple: Tuple}>) => void
    set: (slotId: string, tuple: Tuple, out: TupleReceiver) => void
    delete: (slotId: string, out: TupleReceiver) => void
}

