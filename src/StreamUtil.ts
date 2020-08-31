
import Stream from './Stream'
import Tuple from './Tuple';

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

export function streamPostFilter(stream: Stream, filter: (t: Tuple) => boolean) {
    return {
        next(t: Tuple) {
            if (filter(t))
                stream.next(t)
        },
        done() {
            stream.done();
        }
    }
}

export function streamPostModify(stream: Stream, callback: (t: Tuple) => Tuple | null) {
    return {
        next(t: Tuple) {
            const modified = callback(t);
            if (modified && !modified.isEmpty())
                stream.next(modified)
        },
        done() {
            stream.done();
        }
    }
}

export function streamPostRemoveAttr(stream: Stream, attr: string) {
    return streamPostModify(stream, (t: Tuple) => t.remapTags(tag => tag.attr === attr ? null : tag));
}