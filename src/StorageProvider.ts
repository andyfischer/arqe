
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'
import SearchOperation from './SearchOperation'
import RelationReceiver from './RelationReceiver'

export default interface StorageProvider {
    runSearch: (search: SearchOperation) => void
    runSave: (relation: Relation, output: RelationReceiver) => void
}
