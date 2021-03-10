
import Graph from './Graph'
import Tuple, { singleTagToTuple } from "./Tuple"
import Stream from './Stream'
import Relation from './Relation';
import Query from './Query'
import { QueryLike } from './coerce'

export function receiveToTupleList(onDone: (rels: Tuple[]) => void): Stream {
    const list: Tuple[] = [];
    return {
        _receiveToTupleList: true,
        next(t) {
            // console.log('receiveToTupleList got result')
            list.push(t)
        },
        done() {
            // console.log('receiveToTupleList onDone')
            onDone(list);
        }
    } as any as Stream;
}

export function fallbackReceiver(query: Query): Stream {
    return {
        next(t: Tuple) {
            if (t.hasAttr('command-meta') && t.hasAttr('error')) {
                console.log(`Uncaught error for command (${query.stringify()}): ${t.str()}`);
            }
        },
        done() { }
    }
}

export function receiveToRelation(onDone: (rel: Relation) => void) {
    const tuples = [];
    return {
        next(t: Tuple) {
            tuples.push(t);
        },
        done() {
            onDone(new Relation(tuples));
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
