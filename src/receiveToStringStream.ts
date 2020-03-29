
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import stringifyRelationStream from './stringifyRelationStream'

export default function receiveToStringStream(onStr: (s: string) => void): RelationReceiver {
    const stringifier = stringifyRelationStream();

    return {
        start() {},
        isDone() { return false },
        relation(rel: Relation) { 
            const str = stringifier(rel);
            if (str)
                onStr(str);
        },

        finish() {
            onStr('#done');
        }
    }
}