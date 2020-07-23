
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

export function joinNStreams(count: number, joinedOutput: Stream) {
    let waitingForCount = count;

    const out = [];

    for (let i = 0; i < count; i++) {
        out.push({
            next(t) { joinedOutput.next(t) },
            done() { 
                waitingForCount--;
                if (waitingForCount === 0)
                    joinedOutput.done();
            }
        })
    }

    return out;
}