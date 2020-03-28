
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export default function receiveToStrings(onDone: (s: string|string[]) => void): RelationReceiver {

    let searchPattern = null;
    let actionPerformed = null;
    const rels = [];

    return {
        start() {},
        relation: (rel: Relation) => {
            if (rel.hasType('command-meta')) {
                if (rel.hasType('action-performed')) {
                    actionPerformed = rel;
                    return;
                }

                if (rel.hasType('search-pattern')) {
                    searchPattern = rel;
                    return;
                }
            }

            rels.push(rel);
        },
        isDone() { return false },
        finish: () => {
            // Stringify
            if (actionPerformed) {
                onDone('#done');
                return;
            }

            onDone(rels.map(rel => rel.stringifyRelation()));
        }
    }
}
