import Tuple, { singleTagToTuple } from "./Tuple"
import Stream from "./Stream"
import { symValueStringify, symValueType } from "./internalSymbols"
import { newSimpleTag } from "./TupleTag";

export default class Relation {
    header: Tuple
    all: Tuple[] = [];
    tuples: Tuple[] = [];
    errors?: Tuple[]

    headerAttrToIndex?: Map<string, number>

    [symValueType] = 'relation'

    constructor(tuples: Tuple[]) {
        
        for (const tuple of tuples) {
            this.all.push(tuple);

            if (tuple.isCommandMeta()) {
                if (tuple.isCommandError()) {
                    this.errors = this.errors || [];
                    this.errors.push(tuple);
                } else if (tuple.isCommandSearchPattern()) {
                    this.header = tuple;
                }
            } else {
                this.tuples.push(tuple);
            }
        }
    }

    stringify() {
        return `[${this.all.map(t => t.stringify()).join(', ')}]`    
    }

    [symValueStringify]() {
        return this.stringify();
    }

    getOrInferHeader() {
        if (this.header)
            return this.header.removeAttr('command-meta').removeAttr('search-pattern');

        return new Tuple([newSimpleTag('infer-header-not-supported')])
    }

    getTuplesSortedByHeader() {
        const header = this.getOrInferHeader();

        return this.tuples.map(tuple => {
            const outTags = [];
            for (const headerTag of header.tags) {
                outTags.push(tuple.getTag(headerTag.attr) || newSimpleTag(headerTag.attr));
            }
            return new Tuple(outTags);
        })
    }
}

export function receiveToRelation(out: Stream, attrName: string): Stream {
    const tuples = [];

    return {
        next(t) {
            tuples.push(t);
        },
        done() {
            const relation = new Relation(tuples);
            out.next(singleTagToTuple(attrName, relation));
            out.done();
        }
    }
}

