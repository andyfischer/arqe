
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'

export interface Stream<T> {
    receive: (val: T) => void
    finish: () => void
}

export class StreamCombine<T> {
    waitingForCount = 0
    output: Stream<T>

    constructor(output: Stream<T>) {
        this.output = output;
    }

    receive(): Stream<T> {
        this.waitingForCount++;

        return {
            receive: (t) => { this.output.receive(t) },
            finish: () => {
                this.waitingForCount--;
                if (this.waitingForCount === 0)
                    this.output.finish();
            }
        }
    }
}

export default interface TableInterface {
    scan: (out: Stream<{slotId: string, tuple: Tuple}>) => void
    set: (slotId: string, tuple: Tuple, out: TupleReceiver) => void
    delete: (slotId: string, out: TupleReceiver) => void
}

