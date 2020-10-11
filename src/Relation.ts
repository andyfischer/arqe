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

    errorsToErrorObject(): Error | null {
        if (!this.errors || this.errors.length == 0)
            return null;

        const firstError = this.errors[0];
        return new Error(firstError.getVal('message'));
    }

    stringify() {
        return `[${this.all.map(t => t.stringify()).join(', ')}]`    
    }

    stringifyBody() {
        return `[${this.tuples.map(t => t.stringify()).join(', ')}]`    
    }

    [symValueStringify]() {
        return this.stringify();
    }

    getOrInferHeader() {
        if (this.header)
            return this.header.removeAttr('command-meta').removeAttr('search-pattern');

        if (this.tuples.length === 0)
            return new Tuple([]);

        return new Tuple([newSimpleTag('error'), newSimpleTag('infer-header-not-supported')])
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

export function receiveToRelationInStream(out: Stream, attrName: string): Stream {
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

export function receiveToRelationSync(): [Stream, () => Relation] {
    const tuples = [];
    let isDone = false;

    const stream: Stream = {
        next(t) {
            tuples.push(t);
        },
        done() {
            isDone = true;
        }
    }

    const get = () => {
        if (!isDone)
            throw new Error("receiveToRelationSync - stream isn't finished");

        return new Relation(tuples);
    }

    return [ stream, get ];
}

export function receiveToRelationCallback(callback: (Relation) => void): Stream {

    const tuples = [];

    const stream: Stream = {
        next(t) {
            tuples.push(t);
        },
        done() {
            const rel = new Relation(tuples);
            callback(rel);
        }
    }

    return stream;
}

export function receiveToRelationAsync(): [ Stream, Promise<Relation> ] {

    let stream: Stream;

    const promise: Promise<Relation> = new Promise((resolve, reject) => {
        const tuples = [];

        stream = {
            next(t) {
                tuples.push(t);
            },
            done() {
                const relation = new Relation(tuples);
                const error = relation.errorsToErrorObject();
                if (error)
                    reject(error);
                else
                    resolve(relation);
            }
        }
    })

    return [ stream, promise ]
}

export function relationToJsonable(rel: Relation) {
    return {
        type: 'relation',
        tuples: rel.tuples.map(t => t.stringify())
    }
}

export function jsonableToRelation(json: any): Relation {
    if (json.type !== 'relation') {
        throw new Error("jsonableToRelation: object doesn't have type = relation");
    }

    const tuples = json.tuples;
    return new Relation(tuples);
}

export function isRelation(val: any) {
    return val && (val[symValueType] === 'relation');
}
