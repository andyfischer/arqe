
import Graph from './Graph'
import Tuple from './Tuple'
import Stream from './Stream'
import Relation from './Relation';

export function receiveToTupleList(onDone: (rels: Tuple[]) => void): Stream {
    const list: Tuple[] = [];
    return {
        next(rel) { list.push(rel) },
        done() {
            onDone(list);
        }
    }
}

export function receiveToTupleListPromise(): { receiver: Stream, promise: Promise<Tuple[]> } {

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

    return { receiver, promise };
}

export async function runAsync(graph: Graph, command: string) {
    const { receiver, promise } = receiveToTupleListPromise();
    graph.run(command, receiver);
    const rels: Tuple[] = (await promise)
        .filter(rel => !rel.hasAttr("command-meta"));
    return rels;
}

export function fallbackReceiver(commandString: string): Stream {
    return {
        next(t: Tuple) {
            if (t.hasAttr('command-meta') && t.hasAttr('error')) {
                console.log(`Uncaught error for command (${commandString}): ${t.str()}`);
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