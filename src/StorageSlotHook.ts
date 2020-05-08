
import Graph from './Graph'
import Pattern from './Pattern'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import Slot from './Slot'
import SlotReceiver from './SlotReceiver'

export default interface StorageSlotHook {
    hookPattern: (pattern: Pattern) => boolean
    saveNewRelation: (relation: Relation, output: RelationReceiver) => void
    iterateSlots: (pattern: Pattern, output: SlotReceiver) => void
}
