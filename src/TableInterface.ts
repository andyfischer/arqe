
import Tuple from './Tuple'
import Stream from './Stream'

export interface GenericStream<T> {
    receive: (val: T) => void
    finish: () => void
}

export class StreamCombine<T> {
    waitingForCount = 0
    output: GenericStream<T>

    constructor(output: GenericStream<T>) {
        this.output = output;
    }

    receive(): GenericStream<T> {
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
    scan: (out: GenericStream<{slotId: string, tuple: Tuple}>) => void
    insert: (tuple: Tuple, out: Stream) => void
    update: (slotId: string, tuple: Tuple, out: Stream) => void
    delete: (slotId: string, out: Stream) => void
}

