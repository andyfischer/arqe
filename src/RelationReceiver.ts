
import Graph from './Graph'
import Command from './Command'
import Relation from './Relation'

export default interface RelationReceiver {
    relation: (rel: Relation) => void
    finish: () => void
}

export function receiveToRelationStream(onRel: (rel: Relation) => void, onDone: () => void): RelationReceiver {
    return {
        relation: onRel,
        finish: onDone
    }
}

export function receiveToNull(): RelationReceiver {
    return {
        relation(rel) {  },
        finish() {  }
    }
}
