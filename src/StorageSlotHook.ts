
import Graph from './Graph'
import Relation from './Relation'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export interface Slot {
    relation: Pattern
    modify: (f: (rel: Pattern) => Pattern) => Pattern
}

export default interface StorageSlotHook {
    hookPattern: (pattern: Pattern) => boolean
    saveNewRelation: (relation: Relation, output: RelationReceiver) => void
    iterateSlots: (pattern: Pattern) => Iterable<Slot>
}
