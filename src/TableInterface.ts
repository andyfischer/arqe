
import Tuple from './Tuple'

interface Stream<T> {
    receive: (done: boolean, val?: T) => void
}

export type ReceiverFunc<T> = (done: boolean, val?: T) => void
export type TupleReceiverFunc = ReceiverFunc<Tuple>
export type SlotReceiverFunc = ReceiverFunc<{slotId: string, tuple: Tuple}>

export default interface TableInterface {
    scan: (func: ReceiverFunc<{slotId: string, tuple: Tuple}>) => void
    set: (slotId: string, tuple: Tuple, func: ReceiverFunc<Tuple>) => void
    delete: (slotId: string, func: ReceiverFunc<Tuple>) => void
}
