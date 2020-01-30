
import Command from './Command'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import GetOperation from './GetOperation'

export default interface StorageProvider {
    runSearch: (get: GetOperation) => void
    save: (command: Command) => Relation
}
