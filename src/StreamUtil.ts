
import TupleReceiver from './TupleReceiver'

/*
export function combineStreams({
    output: TupleReceiver,
    whenDone: () => {}
}): TupleReceiver {

}
*/

type NewReceiverFunc = () => TupleReceiver

export function combineStreams(output: TupleReceiver): NewReceiverFunc {
    let waitingForCount = 0;

    return () => {
        waitingForCount += 1;
        return {
            relation(t) { output.relation(t) },
            finish() {
                waitingForCount--;
                if (waitingForCount === 0)
                    output.finish();
            }
        }
    }
}
