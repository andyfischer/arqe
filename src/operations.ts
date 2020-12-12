
import TupleTag, { newSimpleTag } from './TupleTag'
import Tuple, { newTuple } from './Tuple'
import Stream from './Stream'

const s_tupleAbstract: Tuple = newTuple([newSimpleTag('abstract')]);

export function remapTags(t: Tuple, callback: (tag:TupleTag) => TupleTag | null): Tuple {
    return newTuple(t.tags.map(callback).filter(tag => tag));
}

export function streamMap(mapper: (Tuple) => Tuple|null, out: Stream) {
    return {
        next(t) {
            const mapped = mapper(t);
            if (mapped)
                out.next(mapped);
        },
        done() {
            out.done()
        }
    }
}

export function splitTuple(t: Tuple, callback: (tag:TupleTag) => boolean): [Tuple,Tuple] {
    const firstTags: TupleTag[] = [];
    const secondTags: TupleTag[] = [];

    for (const tag of t.tags) {
        if (callback(tag))
            firstTags.push(tag)
        else
            secondTags.push(tag);
    }

    return [ newTuple(firstTags), newTuple(secondTags) ]
}

export function abstractHoles(tuple: Tuple) {
    return remapTags(tuple, tag => {
        if (!tag.hasValue())
            return tag.setValue(s_tupleAbstract);
        return tag;
    });
}
