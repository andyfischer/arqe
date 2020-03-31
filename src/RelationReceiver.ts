
import Graph from './Graph'
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'

export default interface RelationReceiver {
    relation: (rel: Pattern) => void
    finish: () => void
    isDone: () => boolean
}

export function receiveToRelationList(onDone: (rels: Pattern[]) => void): RelationReceiver {
    const list: Pattern[] = [];
    return {
        relation(rel) { list.push(rel) },
        isDone() { return false; },
        finish() {
            onDone(list);
        }
    }
}

export function receiveToRelationStream(onRel: (rel: Pattern) => void, onDone: () => void): RelationReceiver {
    return {
        relation: onRel,
        isDone() { return false; },
        finish: onDone
    }
}

export function receiveToNull(): RelationReceiver {
    return {
        relation(rel) {  },
        isDone() { return true },
        finish() {  }
    }
}
