
import Tuple from './Tuple'
import { ReceiverFunc, TupleReceiverFunc, TupleReceiverCombine } from './ReceiverFunc'

interface Stream<T> {
    receive: (val: T | null) => void
}
export default interface TableInterface {
    scan: (func: ReceiverFunc<{slotId: string, tuple: Tuple}>) => void
    set: (slotId: string, tuple: Tuple, func: ReceiverFunc<Tuple>) => void
    delete: (slotId: string, func: ReceiverFunc<Tuple>) => void
}
