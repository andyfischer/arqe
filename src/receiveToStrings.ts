
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export default function receiveToStrings(onDone: (s: string|string[]) => void): RelationReceiver {

    const rels = [];

    return {
        start() {},
        relation: (rel: Relation) => {
            rels.push(rel);
        },
        isDone() { return false },
        finish: () => {
            // Stringify
            if (rels.length === 1 && rels[0].hasType('command-meta') && rels[0].hasType('action-performed')) {
                onDone('#done');
                return;
            }

            onDone(rels.map(rel => rel.stringifyRelation()));
        }
    }
}
