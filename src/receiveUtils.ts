
import Graph from './Graph'
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'

export function receiveToTupleList(onDone: (rels: Tuple[]) => void): TupleReceiver {
    const list: Tuple[] = [];
    return {
        relation(rel) { list.push(rel) },
        finish() {
            onDone(list);
        }
    }
}

export function receiveToTupleListPromise(): { receiver: TupleReceiver, promise: Promise<Tuple[]> } {

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

export function fallbackReceiver(commandString: string): TupleReceiver {
    return {
        relation(rel) {
            if (rel.hasAttr('command-meta') && rel.hasAttr('error')) {
                console.log(`Uncaught error for command (${commandString}): ${rel.stringifyRelation()}`);
            }
        },
        finish() { }
    }
}
