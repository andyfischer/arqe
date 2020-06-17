
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'

export default class CombineTupleStreams {
    waitingForCount = 0
    output: TupleReceiver

    constructor(output: TupleReceiver) {
        this.output = output;
    }

    receive(): TupleReceiver {
        this.waitingForCount++;
        return {
            relation(t) { this.output.relation(t) },
            finish() {
                this.waitingForCount--;
                if (this.waitingForCount === 0)
                    this.output.finish();
            }
        }
    }
}
