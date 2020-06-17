
import Graph from './Graph'
import Command from './Command'
import Tuple from './Tuple'

export default interface TupleReceiver {
    next: (t: Tuple) => void
    finish: () => void
}

export function receiveToTupleStream(onRel: (t: Tuple) => void, onDone: () => void): TupleReceiver {
    return {
        next: onRel,
        finish: onDone
    }
}

export function receiveToNull(): TupleReceiver {
    return {
        next(rel) {  },
        finish() {  }
    }
}
