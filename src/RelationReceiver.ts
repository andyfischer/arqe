
import Graph from './Graph'
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'
import { RespondFunc } from './Graph'

export default interface RelationReceiver {
    start: () => void
    relation: (rel: Pattern) => void
    finish: () => void
    isDone: () => boolean
}

export function receiveToRelationList(onDone: (rels: Pattern[]) => void): RelationReceiver {
    const list: Pattern[] = [];
    return {
        start() {},
        relation(rel) { list.push(rel) },
        isDone() { return false; },
        finish() {
            onDone(list);
        }
    }
}

export function receiveToRelationStream(onRel: (rel: Pattern) => void, onDone: () => void): RelationReceiver {
    return {
        start() {},
        relation: onRel,
        isDone() { return false; },
        finish: onDone
    }
}

export function receiveToNull(): RelationReceiver {
    return {
        start() {  },
        relation(rel) {  },
        isDone() { return true },
        finish() {  }
    }
}
