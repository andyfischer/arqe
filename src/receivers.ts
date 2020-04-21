
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export function receiveToRelationList(onDone: (rels: Relation[]) => void): RelationReceiver {
    const list: Relation[] = [];
    return {
        relation(rel) { list.push(rel) },
        finish() {
            onDone(list);
        }
    }
}

export function receiveToRelationListPromise(): { receiver: RelationReceiver, promise: Promise<Relation[]> } {

    let receiver;
    const promise: Promise<Relation[]> = new Promise((resolve, reject) => {
        receiver = receiveToRelationList((rels: Relation[]) => {
            for (const rel of rels) {
                if (rel.hasType('command-meta') && rel.hasType('error')) {
                    reject(rel.stringify());
                    return;
                }
            }

            resolve(rels);
        });
    });

    return { receiver, promise };
}

export function fallbackReceiver(commandString: string): RelationReceiver {
    return {
        relation(rel) {
            if (rel.hasType('command-meta') && rel.hasType('error')) {
                console.log(`Uncaught error for command (${commandString}): ${rel.stringifyRelation()}`);
            }
        },
        finish() { }
    }
}
