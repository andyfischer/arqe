
import Graph from './Graph'
import Command from './Command'
import Tuple from './Tuple'

export default interface RelationReceiver {
    relation: (rel: Tuple) => void
    finish: () => void
}

export function receiveToTupleStream(onRel: (rel: Tuple) => void, onDone: () => void): RelationReceiver {
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
