
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'
import SearchOperation from './SearchOperation'
import RelationReceiver from './RelationReceiver'

export default interface StorageProviderV2 {
    handlesPattern: (pattern: Pattern) => boolean
    runSearch: (pattern: Pattern, output: RelationReceiver) => void
    runSave: (pattern: Pattern, output: RelationReceiver) => void
}
