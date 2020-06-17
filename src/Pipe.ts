
import Tuple from './Tuple'
import Stream from './Stream'

export default class Pipe {
    _onTuple: (rel: Tuple) => void
    _onDone: () => void

    _backlog: Tuple[] = []
    _wasClosed: boolean

    // Writer API
    next = (rel: Tuple) => {
        if (this._onTuple)
            this._onTuple(rel);
        else
            this._backlog.push(rel);
    }

    done = () => {
        if (this._onDone)
            this._onDone();
        else
            this._wasClosed = true;
    }

    isDone() {
        return false;
    }

    // Reader API
    onTuple(callback: (rel: Tuple) => void) {
        if (this._onTuple)
            throw new Error('already have an onRelation callback');

        this._onTuple = callback;

        for (const r of this._backlog)
            this._onTuple(r);
    }

    onDone(callback: () => void) {
        if (this._onDone)
            throw new Error('already have an onDone callback');

        this._onDone = callback;

        if (this._wasClosed)
            this._onDone();
    }

    waitForAll(callback: (rels: Tuple[]) => void) {
        const rels = [];
        this.onTuple(rel => { rels.push(rel) });
        this.onDone(() => callback(rels));
    }

    pipeToReceiver(receiver: Stream) {
        this.onTuple(rel => receiver.next(rel));
        this.onDone(() => receiver.done());
    }
}
