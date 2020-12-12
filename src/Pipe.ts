
import Tuple from './Tuple'
import Stream from './Stream'
import { receiveToRelation } from './receiveUtils'
import Relation from './Relation'
import { receiveToRelationInStream } from './receiveUtils'
import { streamMap } from './operations'

export default class Pipe implements Stream {
    output?: Stream

    // Backlog data (in case the output isn't connected yet)
    _stored?: Tuple[] = []
    _inputDone: boolean
    _storedRel?: Relation

    // Stream API
    next = (t: Tuple) => {
        if (this.output) {
            this.output.next(t);
        } else {
            if (!this._stored)
                this._stored = [];
            this._stored.push(t);
            delete this._storedRel;
        }
    }

    done = () => {
        if (this.output)
            this.output.done();
        else
            this._inputDone = true;
    }

    rel() {
        if (this.output)
            throw new Error("Can't create relation, pipe is streaming to an output");

        if (!this._storedRel)
            this._storedRel = new Relation(this._stored);

        return this._storedRel;
    }

    one(filter?: Tuple) {
        return this.rel().one(filter);
    }

    // Pipe API
    sendTo(receiver: Stream) {
        if (this.output)
            throw new Error("Already have an output stream");

        this.output = receiver;

        if (this._stored) {
            // Pass along backlogged data.
            for (const t of this._stored)
                this.output.next(t);
        }

        delete this._stored;
        delete this._storedRel;

        if (this._inputDone)
            this.output.done();
    }

    whenDone(callback: (rel: Relation) => void) {
        this.sendTo(receiveToRelation(callback));
    }

    then(callback: (rel: Relation) => void) {
        this.sendTo(receiveToRelation(callback));
    }

    sendRelationTo(out: Stream, attrName: string) {
        this.sendTo(receiveToRelationInStream(out, attrName));
    }

    take() {
        if (this.output)
            throw new Error("Can't call .take, pipe is connected to an output")

        const result = this._stored;
        delete this._stored;
        return result;
    }

    takeAsRelation() {
        return new Relation(this.take())
    }

    map(mapper: (Tuple) => Tuple|null): Pipe {
        const out = new Pipe();
        this.sendTo(streamMap(mapper, out));
        return out;
    }

    filter(callback: (Tuple) => boolean): Pipe {
        const out = new Pipe();
        this.sendTo({
            next(t) {
                if (callback(t))
                    out.next(t);
            },
            done() {
                out.done();
            }
        });
        return out;
    }

    split(count: number): Pipe[] {
        const out = [];

        for (let i = 0; i < count; i++)
            out.push(new Pipe());

        this.sendTo({
            next(t) {
                for (let i = 0; i < count; i++)
                    out[i].next(t);
            },
            done() {
                for (let i = 0; i < count; i++)
                    out[i].done();
            }
        });

        return out;
    }
}
