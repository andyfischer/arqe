
import Stream from './Stream'

/*
export function combineStreams({
    output: TupleReceiver,
    whenDone: () => {}
}): TupleReceiver {

}
*/

type NewReceiverFunc = () => Stream

export function combineStreams(output: Stream): NewReceiverFunc {
    let waitingForCount = 0;

    return () => {
        waitingForCount += 1;
        return {
            next(t) { output.next(t) },
            done() {
                waitingForCount--;
                if (waitingForCount === 0)
                    output.done();
            }
        }
    }
}
