
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export default interface StorageProvider {
    runSearch: (pattern: Pattern, output: RelationReceiver) => void
    runSave: (pattern: Pattern, output: RelationReceiver) => void
}
