import Stream from "./Stream";
import Tuple, { isTuple } from "./Tuple";
import { TupleLike, RelationLike, toRelation, toTuple } from './coerce'

export default class OutputStream implements Stream {
    _relativeTuple: Tuple
    _next: (t: Tuple) => void;
    _done: () => void;

    constructor(input: Tuple, out: Stream) {
        this._relativeTuple = input;
        this._next = out.next;
        this._done = out.done;
    }

    nextTuple(t: Tuple) {
        if (this._relativeTuple) {
            let combined = this._relativeTuple;
            for (const tag of t.tags) {
                combined = combined.setTag(tag);
            }
            this._next(combined);
        } else {
            this._next(t);
        }
    }

    next(val?: TupleLike) {
        this.nextTuple(toTuple(val));
    }

    done(val?: RelationLike) {
        if (val) {
            for (const t of toRelation(val).tuples) {
                this.nextTuple(t);
            }
        }

        this._done();
    }
}
