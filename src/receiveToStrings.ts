
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import { commandTagToString } from './stringifyQuery'

export default function receiveToStrings(onDone: (s: string|string[]) => void): RelationReceiver {

    let searchPattern = null;
    let actionPerformed = null;
    const rels = [];

    function stringifyRelation(rel: Relation) {

        const tags = rel.tags.filter(tag => {
            if (searchPattern && searchPattern.fixedTagsForType[tag.tagType])
                return false;

            return true;
        });

        const tagStrs = tags.map(commandTagToString);

        let str = tagStrs.join(' ');
        
        str += (rel.hasPayload() ? ` == ${rel.getPayload()}` : '');

        if (rel.wasDeleted) {
            str = 'delete ' + str;
        }

        return str;
    }

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

            if (searchPattern && !searchPattern.isMultiMatch()) { 
                if (rels.length === 0) {
                    onDone('#null');
                } else {
                    onDone('#exists');
                }

                return;
            }

            onDone(rels.map(rel => stringifyRelation(rel)))
        }
    }
}
