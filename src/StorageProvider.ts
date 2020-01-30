
import Command from './Command'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import GetOperation from './GetOperation'
import SetOperation from './SetOperation'

export default interface StorageProvider {
    runSearch: (get: GetOperation) => void
    runSave: (set: SetOperation) => void
}
