
import Graph from './Graph'
import Tuple, { singleTagToTuple } from "./Tuple"
import Stream from './Stream'
import Relation from './Relation';
import Query from './Query'
import { QueryLike } from './coerce'

export function receiveToTupleList(onDone: (rels: Tuple[]) => void): Stream {
    const list: Tuple[] = [];
    return {
        next(rel) { list.push(rel) },
        done() {
            onDone(list);
        }
    }
}

export function receiveToTupleListPromise(): [ Stream, Promise<Tuple[]> ] {

    let receiver;
    const promise: Promise<Tuple[]> = new Promise((resolve, reject) => {
        receiver = receiveToTupleList((rels: Tuple[]) => {
            for (const rel of rels) {
                if (rel.hasAttr('command-meta') && rel.hasAttr('error')) {
                    reject(rel.stringify());
                    return;
                }
            }

            resolve(rels);
        });
    });

    return [ receiver, promise ];
}

export async function runAsync(graph: Graph, command: string) {
    const [ receiver, promise ] = receiveToTupleListPromise();
    graph.run(command, receiver);
    const rels: Tuple[] = (await promise)
        .filter(rel => !rel.hasAttr("command-meta"));
    return rels;
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

interface SingleValueAccessor {
    get: () => any
    done: () => boolean
}

export function receiveToSingleValue(attrName: string): [SingleValueAccessor, Stream] {

    let value = null;
    let error = null;
    let gotValue = false;

    const accessor: SingleValueAccessor = {
        get() {
            if (gotValue) {
                return value;
            }

            if (error)
                throw error;

            throw new Error("receiveToSingleValue - get() called before value was ready")
        },
        done() {
            return error || gotValue;
        }
    }

    const stream: Stream = {
        next(t:Tuple) {
            if (t.isCommandMeta())
                return;

            if (t.hasAttr(attrName)) {
                if (gotValue) {
                    if (!error) {
                        error = new Error("receiveToSingleValue saw duplicate values")
                    }
                    
                    return;
                }

                value = t.getVal(attrName);
                gotValue = true;
            }
        },
        done() {
            if (!gotValue) {
                error = new Error("receiveToSingleValue didn't receive the expected value")
            }
        }
    }

    return [ accessor, stream ]
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

export async function getRelationAsync(query: QueryLike, run: (query: QueryLike, output: Stream) => void): Promise<Relation> {
    const [ stream, promise ] = receiveToRelationAsync();
    run(query, stream);
    return await promise;
}
