
import Tuple from './Tuple'
import Stream from './Stream'
import { receiveToTupleList } from './receiveUtils'
import { receiveToRelation } from './Relation'

export default class Pipe {
    output?: Stream

    // Backlog data (in case the output isn't connected yet)
    _backlog: Tuple[] = []
    _doneCalled: boolean

    // Writer API
    next = (rel: Tuple) => {
        if (this.output)
            this.output.next(rel);
        else
            this._backlog.push(rel);
    }

    done = () => {
        if (this.output)
            this.output.done();
        else
            this._doneCalled = true;
    }

    sendTo(receiver: Stream) {
        if (this.output)
            throw new Error("Already have an output stream");

        this.output = receiver;

        // Pass along backlogged data.
        for (const t of this._backlog)
            this.output.next(t);

        this._backlog = [];

        if (this._doneCalled)
            this.output.done();
    }

    waitForAll(callback: (ts: Tuple[]) => void) {
        this.sendTo(receiveToTupleList(callback));
    }

    sendRelationTo(out: Stream, attrName: string) {
        this.sendTo(receiveToRelation(out, attrName));
    }
}
