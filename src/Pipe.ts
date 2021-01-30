
import Tuple from './Tuple'
import Stream from './Stream'
import { receiveToRelation } from './receiveUtils'
import Relation from './Relation'
import { streamMap } from './operations'
import randomHex from './utils/randomHex'

export const EnablePipeTracing = true;

export default class Pipe implements Stream {

    id?: string
    output?: Stream

    // Backlog data (in case the output isn't connected yet)
    _buffer?: Tuple[] = []
    _bufferRel?: Relation
    _inputDone: boolean

    constructor(label: string) {
        if (EnablePipeTracing) {
            this._traceLabel = label;
            this._traceStack = (new Error()).stack;
            this.id = `pipe-${randomHex(8)}`
        }
    }

    // Tracing data
    _traceLabel?: string
    _traceStack?: any
    _tracedInputs?: {
        input: Pipe,
        label: string
    }[]

    _addTracedInput(label: string, input: Pipe) {
        this._tracedInputs = this._tracedInputs || [];
        this._tracedInputs.push({label, input});
    }

    // Stream API
    next = (t: Tuple) => {
        if (this.output) {
            this.output.next(t);
        } else {
            if (!this._buffer)
                this._buffer = [];
            this._buffer.push(t);
            delete this._bufferRel;
        }
    }

    done = () => {
        if (this._inputDone)
            throw new Error(`${this.id}(${this._traceLabel}) got multiple done() messages`)

        if (this.output)
            this.output.done();
        else
            this._inputDone = true;
    }

    rel() {
        if (this.output)
            throw new Error("Can't create relation, pipe is streaming to an output");

        if (!this._bufferRel)
            this._bufferRel = new Relation(this._buffer);

        return this._bufferRel;
    }

    buffer() {
        if (this.output)
            throw new Error("Pipe is streaming, has no buffer");

        return this._buffer;
    }

    deleteBuffer() {
        delete this._buffer;
    }

    bodyArr() {
        return this.rel().bodyArr();
    }

    one(filter?: Tuple) {
        return this.rel().one(filter);
    }

    oneValue(attr: string) {
        return this.rel().oneValue(attr);
    }

    // Pipe API
    sendTo(receiver: Stream, traceLabel?: string) {
        if (this.output)
            throw new Error(`${this.id}(${this._traceLabel}).sendTo failed: Already has an output.`);

        this.output = receiver;

        if (EnablePipeTracing) {
            if (receiver._addTracedInput) {
                receiver._addTracedInput(traceLabel || 'sendTo', this);
            } else if (receiver._pipe) {
                receiver._pipe._addTracedInput(traceLabel || 'sendTo', this);
            }
        }

        if (this._buffer) {
            // Pass along backlogged data.
            for (const t of this._buffer)
                this.output.next(t);
        }

        delete this._buffer;
        delete this._bufferRel;

        if (this._inputDone)
            this.output.done();
    }

    isDone() {
        return this._inputDone;
    }

    whenDone(callback: (rel: Relation) => void) {
        this.sendTo(receiveToRelation(callback));
    }

    then(callback: (rel: Relation) => void) {
        this.sendTo(receiveToRelation(callback));
    }

    take() {
        if (this.output)
            throw new Error("Can't call .take, pipe is connected to an output")

        const result = this._buffer;
        delete this._buffer;
        return result;
    }

    takeAsRelation() {
        return new Relation(this.take())
    }

    map(mapper: (Tuple) => Tuple|null, traceLabel?: string): Pipe {
        const out = new Pipe('map');
        this.sendTo(streamMap(mapper, out), 'map: ' + traceLabel);
        return out;
    }

    filter(callback: (Tuple) => boolean): Pipe {
        const out = new Pipe('filter');
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
            out.push(new Pipe('split'));

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

    stringify() {
        if (this.output)
            return `Pipe(streaming..)`
        else
            return `Pipe` + this.rel().stringify();
    }

    stringifyBuffer() {
        return this.buffer().map(t => t.stringify());
    }

    stringifyBody() {
        return this.bodyArr().map(t => t.stringify());
    }
}

export function newNullPipe() {
    const pipe = new Pipe('null');
    pipe.done();
    return pipe;
}

export function newPrefilledPipe(items: Tuple[]) {
    const pipe = new Pipe('prefilled');
    pipe._buffer = items;
    pipe.done();
    return pipe;
}

export function joinPipes(pipes: Pipe[]) {
    const result = new Pipe('join');
    let expectedDoneMessages = pipes.length;

    for (const pipe of pipes) {
        pipe.sendTo({
            next(t) { result.next(t) },
            done() {
                expectedDoneMessages--;
                if (expectedDoneMessages === 0)
                    result.done()
            },
            _pipe: pipe
        }, 'join');
    }

    return result;
}

