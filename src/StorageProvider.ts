
import Command from './Command'
import Relation from './Relation'
import Pattern from './Pattern'
import SetOperation from './SetOperation'
import RelationSearch from './RelationSearch'

export default interface StorageProvider {
    runSearch: (search: RelationSearch) => void
    runSave: (set: SetOperation) => void
}
