
import Command from './Command'
import Relation from './Relation'
import RelationPattern from './RelationPattern'

export default interface StorageProvider {
    findAllMatches: (pattern: RelationPattern) => any
    save: (command: Command) => Relation
}
