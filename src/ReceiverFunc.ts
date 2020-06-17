
import Tuple from './Tuple'
export type ReceiverFunc<T> = (val: T | null) => void
export type TupleReceiverFunc = ReceiverFunc<Tuple>
export type SlotReceiverFunc = ReceiverFunc<{slotId: string, tuple: Tuple}>

export class ReceiverCombine<T> {

    waitingForCount = 0
    output: ReceiverFunc<T>

    constructor(output: ReceiverFunc<T>) {
        this.output = output;
    }

    receive(): ReceiverFunc<T> {
        this.waitingForCount += 1

        return (t: T | null) => {
            if (t === null) {
                this.waitingForCount--;
                if (this.waitingForCount === 0)
                    this.output(null);
            } else {
                this.output(t);
            }
        }
    }
}

export type TupleReceiverCombine = ReceiverCombine<Tuple>
