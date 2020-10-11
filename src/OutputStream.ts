import Stream from "./Stream";
import Tuple, { isTuple } from "./Tuple";
import { RelationLike, toRelation } from './coerce'

export default class OutputStream implements Stream {
    input: Tuple
    _next: (t: Tuple) => void;
    _done: () => void;

    constructor(input: Tuple, out: Stream) {
        this.input = input;
        this._next = out.next;
        this._done = out.done;
    }

    nextTuple(t: Tuple) {
        let combined = this.input;
        for (const tag of t.tags) {
            combined = combined.setTag(tag);
        }
        this._next(combined);
    }

    next(val?: RelationLike) {
        if (isTuple(val)) {
            this.nextTuple(val as Tuple);
        } else {
            for (const t of toRelation(val).tuples)
                this.nextTuple(t);
        }
    }

    done(val?: RelationLike) {
        if (val) {
            this.next(val);
        }

        this._done();
    }
}
