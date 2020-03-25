
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'
import RelationSearch from './RelationSearch'
import RelationReceiver from './RelationReceiver'

export default interface StorageProvider {
    runSearch: (search: RelationSearch) => void
    runSave: (command: Command, output: RelationReceiver) => void
}
