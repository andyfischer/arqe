
import Slot from './Slot'
import RelationReceiver from './RelationReceiver'

export default interface SlotReceiver {
    slot: (slot: Slot) => void
    relationOutput: RelationReceiver
    finish: () => void
}
