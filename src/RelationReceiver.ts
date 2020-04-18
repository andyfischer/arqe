
import Graph from './Graph'
import Command from './Command'
import Relation from './Relation'

export default interface RelationReceiver {
    relation: (rel: Relation) => void
    finish: () => void
    isDone: () => boolean
}

export function receiveToRelationStream(onRel: (rel: Relation) => void, onDone: () => void): RelationReceiver {
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
