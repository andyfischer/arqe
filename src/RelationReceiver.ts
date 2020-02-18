
import Relation from './Relation'

export default interface RelationReceiver {
    start: () => void
    relation: (rel: Relation) => void
    deleteRelation: (rel: Relation) => void
    error: (str: string) => void
    finish: () => void
    isDone: () => boolean
}

export function collectRelationReceiverOutput(onDone: (rels: Relation[]) => void): RelationReceiver {
    const list: Relation[] = [];
    return {
        start() {},
        relation(rel) { list.push(rel) },
        deleteRelation(rel) {},
        error(e) { console.log('unhandled error in outputToRelationList: ', e) },
        isDone() { return false; },
        finish() {
            onDone(list);
        }
    }
}
